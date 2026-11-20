import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const current = await LocalNotifications.checkPermissions();
    const result = current.display === 'granted'
      ? current
      : await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  }
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  return (await Notification.requestPermission()) === 'granted';
}

export async function scheduleStageNotification(title: string, body: string, at: number) {
  const delay = Math.max(0, at - Date.now());
  if (Capacitor.isNativePlatform()) {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') return;
    await LocalNotifications.schedule({
      notifications: [{
        id: Math.floor(Date.now() % 2_000_000_000),
        title,
        body,
        schedule: { at: new Date(Date.now() + delay) },
        sound: 'default'
      }]
    });
    return;
  }
  // Browser notification is a fallback while developing in a desktop browser.
  if ('Notification' in window && Notification.permission === 'granted') {
    window.setTimeout(() => new Notification(title, { body }), delay);
  }
}
