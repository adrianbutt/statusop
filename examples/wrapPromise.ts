import { wrapPromise } from "statusop";
import type {
  IReadonlyStatusOp,
  IStatusOpStatus,
  WrappedPromiseStatusOp
} from "statusop";

type ExampleExpensiveTaskMap = {
  readonly promise: Promise<ExampleExpensiveTaskPayload>;
  onprogress?: (p: number) => void;
};
type ExampleExpensiveTaskPayload = {
  duration: number;
  data: string;
};

function exampleExpensiveTask(): ExampleExpensiveTaskMap {
  let promiseMap: ExampleExpensiveTaskMap;

  const promise = new Promise<ExampleExpensiveTaskPayload>(resolve => {
    const runEveryMS = 100;
    const runNTimes = 100;
    let runCounter = 0;
    let startTime = Date.now();
    const exInterval = window.setInterval(() => {
      runCounter++;

      if (runCounter >= runNTimes) {
        window.clearInterval(exInterval);
        resolve({
          duration: Date.now() - startTime,
          data: `result of some fancy operation`
        });
      } else if (promiseMap.onprogress) {
        promiseMap.onprogress(runCounter / runNTimes);
      }
    }, runEveryMS);
  });

  promiseMap = {
    promise
  };

  return promiseMap;
}

export async function standardExample() {
  // imagine this was some sort of task running in the background...
  const promiseMap = exampleExpensiveTask();

  // generate our op
  const op = wrapPromise(promiseMap.promise);

  // to notify progress
  promiseMap.onprogress = (p: number) => {
    op.notifyProgress(p);
  };

  // we could listen to progress events like so:
  op.on(
    "progress",
    (
      progress: number,
      sender: WrappedPromiseStatusOp<ExampleExpensiveTaskPayload>
    ) => {}
  );
  op.on("progress", (progress: number, sender: typeof op) => {});

  // if we want restricted access to the op:
  op.getStatusObject().on(
    "progress",
    (
      progress: number,
      sender: IStatusOpStatus<ExampleExpensiveTaskPayload>
    ) => {}
  );
  op.getReadonlyObject().on(
    "progress",
    (
      progress: number,
      sender: IReadonlyStatusOp<ExampleExpensiveTaskPayload>
    ) => {}
  );

  // for completion we could listen to the complete event
  op.on(
    "complete",
    (response: ExampleExpensiveTaskPayload, sender: typeof op) => {}
  );
  op.getStatusObject().on(
    "complete",
    (
      response: ExampleExpensiveTaskPayload,
      sender: IStatusOpStatus<ExampleExpensiveTaskPayload>
    ) => {}
  );

  // for errors:
  op.on("error", (error: unknown, sender: typeof op) => {});
  op.getStatusObject().on(
    "error",
    (error: unknown, sender: IStatusOpStatus<ExampleExpensiveTaskPayload>) => {}
  );

  // the op is a promise, so we can use it in the same way..
  await op;

  // the readonly op is also promise, so we can use it in the same way..
  await op.getReadonlyObject();
}
