import { useEffect, useState } from 'react';
import { getCookingPlan } from '../api';
import { playRetroAlert, playVibrationAlert } from '../alerts';
import { createPlan, USDA_MINIMUM_REST_SECONDS } from '../cooking';
import { requestNotificationPermission, scheduleStageNotification } from '../notifications';
import { DEFAULT_CONFIG } from '../options';
import { clearSession, loadSession, saveSession } from '../storage';
import type { CookConfig, CookPlan, Preferences, Stage } from '../types';

/** The three stages that run a countdown timer. */
type TimedStage = 'first-side' | 'second-side' | 'rest';

/** Where the app goes automatically when each timed stage runs out. */
const NEXT_STAGE_AFTER_TIMER: Record<TimedStage, Stage> = {
  'first-side': 'flip',
  'second-side': 'temperature',
  'rest': 'complete',
};

/** The system notification shown when each timed stage runs out. */
const NOTIFICATION_WHEN_TIMER_ENDS: Record<TimedStage, { title: string; body: string }> = {
  'first-side': { title: 'Time to flip!', body: 'Turn your steak over.' },
  'second-side': { title: 'Check your steak', body: 'Check internal temperature with a thermometer.' },
  'rest': { title: 'Steak is ready to serve', body: 'Your resting timer is complete.' },
};

export function isTimedStage(stage: Stage): stage is TimedStage {
  return stage in NEXT_STAGE_AFTER_TIMER;
}

/**
 * All the state and actions for one cook, from setup to "ready to eat".
 *
 * How the timer works: the session stores the exact moment the current
 * timer ends (`deadline`). "Seconds left" is recalculated from the clock
 * several times a second, so the countdown stays correct when the app
 * is in the background or the page is reloaded.
 */
export function useCookingSession(preferences: Preferences) {
  // Resume a cook in progress if there is one saved; otherwise start fresh.
  const [savedSession] = useState(loadSession);

  const [config, setConfig] = useState<CookConfig>(
    () => savedSession?.config ?? { ...DEFAULT_CONFIG, doneness: preferences.defaultDoneness },
  );
  const [plan, setPlan] = useState<CookPlan>(() => savedSession?.plan ?? createPlan(DEFAULT_CONFIG));
  const [stage, setStage] = useState<Stage>(savedSession?.stage ?? 'setup');
  const [deadline, setDeadline] = useState<number | null>(savedSession?.deadline ?? null);

  // Feedback for the setup screen while we fetch a plan.
  const [isStarting, setIsStarting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const now = useCurrentTime();
  const secondsRemaining = deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));

  // Save progress on every change so a reload doesn't lose the cook.
  useEffect(() => {
    saveSession({ stage, deadline, config, plan });
  }, [stage, deadline, config, plan]);

  // When a running timer hits zero: beep, buzz, and move to the next screen.
  useEffect(() => {
    if (deadline === null || secondsRemaining > 0 || !isTimedStage(stage)) return;

    if (preferences.soundEnabled) playRetroAlert();
    if (preferences.vibrationEnabled) playVibrationAlert();

    setStage(NEXT_STAGE_AFTER_TIMER[stage]);
    setDeadline(null);
  }, [deadline, secondsRemaining, stage, preferences.soundEnabled, preferences.vibrationEnabled]);

  /** Switches to a timed stage and starts its countdown. */
  function startTimer(timedStage: TimedStage, seconds: number) {
    const endsAt = Date.now() + seconds * 1000;
    setStage(timedStage);
    setDeadline(endsAt);

    // Also schedule a system notification in case the app is in the background.
    const { title, body } = NOTIFICATION_WHEN_TIMER_ENDS[timedStage];
    void scheduleStageNotification(title, body, endsAt);
  }

  // ---- Actions the screens can trigger ----------------------------------

  /** "START COOKING": get a plan (from the API, or the offline estimate) and start side one. */
  async function startCooking() {
    setIsStarting(true);
    setStatusMessage('');

    try {
      const notificationsAllowed = await requestNotificationPermission();
      if (!notificationsAllowed) {
        setStatusMessage('Notifications are off. Keep the app open to hear the timer here.');
      }

      let newPlan: CookPlan;
      try {
        newPlan = await getCookingPlan(config);
      } catch {
        // The backend is optional: if it's down, use the same formula locally.
        newPlan = createPlan(config);
        setStatusMessage('Using the built-in estimate. The cooking API is not reachable yet.');
      }

      setPlan(newPlan);
      startTimer('first-side', newPlan.firstSideSeconds);
    } finally {
      setIsStarting(false);
    }
  }

  /** "I FLIPPED IT": start the second side. */
  function confirmFlip() {
    startTimer('second-side', plan.secondSideSeconds);
  }

  /** "START REST": only reachable once the steak is at a safe temperature. */
  function startRest() {
    startTimer('rest', Math.max(plan.restSeconds, USDA_MINIMUM_REST_SECONDS));
  }

  /** "+30 SEC": push the current timer back by 30 seconds. */
  function addThirtySeconds() {
    setDeadline(Date.now() + (secondsRemaining + 30) * 1000);
  }

  /** "START OVER" / "COOK ANOTHER": wipe the session and go back to setup. */
  function reset() {
    setConfig({ ...DEFAULT_CONFIG, doneness: preferences.defaultDoneness });
    setStage('setup');
    setDeadline(null);
    setStatusMessage('');
    clearSession();
  }

  return {
    config,
    setConfig,
    plan,
    stage,
    secondsRemaining,
    isStarting,
    statusMessage,
    startCooking,
    confirmFlip,
    startRest,
    addThirtySeconds,
    reset,
  };
}

/**
 * Returns the current time (ms), refreshed 4 times a second.
 * Also refreshes immediately when the user switches back to the app,
 * so the countdown never shows a stale value.
 */
function useCurrentTime(): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const intervalId = window.setInterval(refresh, 250);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('pageshow', refresh);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, []);

  return now;
}
