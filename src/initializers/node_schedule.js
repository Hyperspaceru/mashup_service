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
    ///UTC+0 TIME
    ///update DB
    const updateDBJob = schedule.scheduleJob("0 0 21 * * *", async () => {
      if (api.resque.scheduler && api.resque.scheduler.leader) {
        await task.enqueue(
          "DBUpdateLong",
          { time: new Date().toString() },
          "default"
        );
      }
    }); 
    this.scheduledJobs.push(updateDBJob);
     ///Download from vk
     const downloadFromVKjob = schedule.scheduleJob("0 0 23 * * *", async () => {
      if (api.resque.scheduler && api.resque.scheduler.leader) {
        await task.enqueue(
          "DownloadFromVk",
          { time: new Date().toString() },
          "default"
        );
      }
    }); 
    this.scheduledJobs.push(downloadFromVKjob);
     ///Combine video
     const combineVideoJob = schedule.scheduleJob("0 0 1 * * *", async () => {
      if (api.resque.scheduler && api.resque.scheduler.leader) {
        await task.enqueue(
          "CombineVideo",
          { time: new Date().toString() },
          "default"
        );
      }
    }); 
    this.scheduledJobs.push(combineVideoJob);
    ///UploadToYoutube
    const youtubeUploadJob = schedule.scheduleJob("0 0 3 * * *", async () => {
      if (api.resque.scheduler && api.resque.scheduler.leader) {
        await task.enqueue(
          "UploadVideoToYoutube",
          { time: new Date().toString() },
          "default"
        );
      }
    }); 
    this.scheduledJobs.push(youtubeUploadJob);
  }

  stop() {
    this.scheduledJobs.forEach((job) => {
      job.cancel();
    });
  }
}