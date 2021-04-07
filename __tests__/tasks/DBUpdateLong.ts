import { Process, tasks, specHelper } from "actionhero";
const actionhero = new Process();
let api;

describe("Task", () => {
  describe("DBUpdateLong", () => {
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
      await task.enqueue("DBUpdateLong", {});
      const found = await specHelper.findEnqueuedTasks("DBUpdateLong");
      expect(found.length).toEqual(1);
      expect(found[0].timestamp).toBeNull();
    });
  });
});
