import { QueueJob, Schedule, ScheduleExpression } from 'minimal2b/schedule';

// @Cron()
export class AppCronService {
  @Schedule(ScheduleExpression.EVERY_30_SECONDS)
  scheduleHandler() {
    console.log('scheduleHandler');
  }

  @QueueJob(30 * 1000)
  queueJobHandler() {
    console.log('queueJobHandler');
  }
}
