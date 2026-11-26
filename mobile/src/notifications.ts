// System notifications, so the user is told when a timer ends even if the
// app is in the background or the phone is locked.
//
// On a phone (built with Capacitor) we use native local notifications.
// In a desktop browser during development we fall back to the Web Notification API.

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

/** Asks for permission to show notifications. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') return true;

    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  }

  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  return (await Notification.requestPermission()) === 'granted';
}

/** Schedules a notification to appear at the given time (ms since epoch). */
export async function scheduleStageNotification(title: string, body: string, at: number): Promise<void> {
  const delayMs = Math.max(0, at - Date.now());

  if (Capacitor.isNativePlatform()) {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') return;

    await LocalNotifications.schedule({
      notifications: [
        {
          // Native notifications need a unique 32-bit integer ID.
          id: Math.floor(Date.now() % 2_000_000_000),
          title,
          body,
          schedule: { at: new Date(Date.now() + delayMs) },
          sound: 'default',
        },
      ],
    });
    return;
  }

  // Browser fallback: only fires while the tab stays open.
  if ('Notification' in window && Notification.permission === 'granted') {
    window.setTimeout(() => new Notification(title, { body }), delayMs);
  }
}
