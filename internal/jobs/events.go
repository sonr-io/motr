package jobs

type EventTrigger string

var (
	EventTriggerMinute  = EventTrigger("0 * * * * *") // Every minute (with seconds)
	EventTriggerHourly  = EventTrigger("0 */1 * * *") // Every hour at minute 0
	EventTriggerDaily   = EventTrigger("0 0 0 * * *") // Every day at 00:00:00
	EventTriggerWeekly  = EventTrigger("0 0 0 * * 0") // Every Sunday at 00:00:00
	EventTriggerMonthly = EventTrigger("0 0 0 1 * *") // First day of every month at 00:00:00
	EventTriggerYearly  = EventTrigger("0 0 0 1 1 *") // January 1st every year at 00:00:00
)
