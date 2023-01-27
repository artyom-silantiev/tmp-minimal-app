import { Cron, CronExpression, QueueJob, Schedule } from "./core/cron";

@Cron()
export class CronService {
  // @Schedule(CronExpression.EVERY_30_SECONDS)
  scheduleHandler() {
    console.log('scheduleHandler');
  }

  // @QueueJob(30 * 1000)
  queueJobHandler() {
    console.log('queueJobHandler');
  }
}
