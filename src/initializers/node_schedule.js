import * as schedule from "node-schedule";
import { api, task, Initializer } from "actionhero";

export class Scheduler extends Initializer {
  constructor() {
    super();
    this.name = "scheduler";
  }

  initialize() {
    this.scheduledJobs = [];
  }

  start() {
    // do this job every 10 seconds, cron style
    const job = schedule.scheduleJob("0,10,20,30,40,50 * * * * *", async () => {
      // we want to ensure that only one instance of this job is scheduled in our environment at once,
      // no matter how many schedulers we have running
      if (api.resque.scheduler && api.resque.scheduler.leader) {
        await task.enqueue(
          "DBUpdateLong",
          { time: new Date().toString() },
          "default"
        );
      }
    });

    this.scheduledJobs.push(job);
  }

  stop() {
    this.scheduledJobs.forEach((job) => {
      job.cancel();
    });
  }
}