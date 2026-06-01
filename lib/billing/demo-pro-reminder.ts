const REMINDER_DAYS = 7;

export function shouldShowDemoProWaitlistReminder(
  demoProActivatedAt: Date,
  waitlistReminderDismissedAt: Date | null,
  isOnWaitlist: boolean
): boolean {
  if (isOnWaitlist) return false;
  if (waitlistReminderDismissedAt) return false;

  const reminderAt = new Date(demoProActivatedAt);
  reminderAt.setDate(reminderAt.getDate() + REMINDER_DAYS);

  return Date.now() >= reminderAt.getTime();
}
