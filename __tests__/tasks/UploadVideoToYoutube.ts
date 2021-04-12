import { Process, tasks, specHelper } from "actionhero";
const actionhero = new Process();
let api;

describe("Task", () => {
  describe("UploadVideoToYoutube", () => {
    beforeAll(async () => {
      api = await actionhero.start();
    });

    afterAll(async () => {
      await actionhero.stop();
    });

    beforeEach(async () => {
      await api.resque.queue.connection.redis.flushdb();
    });

    test("can be enqueued", async () => {
      await task.enqueue("UploadVideoToYoutube", {});
      const found = await specHelper.findEnqueuedTasks("UploadVideoToYoutube");
      expect(found.length).toEqual(1);
      expect(found[0].timestamp).toBeNull();
    });
  });
});
