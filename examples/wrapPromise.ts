import { wrapPromise } from "statusop";
import type {
  IReadonlyStatusOp,
  IStatusOpStatus,
  IStatusOpEventMap,
  CompleteEventPayload,
  ErrorEventPayload,
  ProgressEventPayload,
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
  op.addEventListener(
    "progress",
    (ev: IStatusOpEventMap<ExampleExpensiveTaskPayload>["progress"]) => {
      // target will be the op
    }
  );
  op.addEventListener(
    "progress",
    (ev: CustomEvent<ProgressEventPayload<ExampleExpensiveTaskPayload>>) => {
      // target will be the op
    }
  );

  // or directly
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
  op.addEventListener(
    "complete",
    (ev: IStatusOpEventMap<ExampleExpensiveTaskPayload>["complete"]) => {
      // target will be the op
    }
  );
  op.addEventListener(
    "complete",
    (ev: CustomEvent<CompleteEventPayload<ExampleExpensiveTaskPayload>>) => {
      // target will be the op
    }
  );

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
  op.addEventListener(
    "error",
    (ev: IStatusOpEventMap<ExampleExpensiveTaskPayload>["error"]) => {
      // target will be the op
    }
  );
  op.addEventListener(
    "error",
    (ev: CustomEvent<ErrorEventPayload<ExampleExpensiveTaskPayload>>) => {
      // target will be the op
    }
  );
  op.on("error", (response: unknown, sender: typeof op) => {});
  op.getStatusObject().on(
    "error",
    (
      response: unknown,
      sender: IStatusOpStatus<ExampleExpensiveTaskPayload>
    ) => {}
  );

  // the op is a promise, so we can use it in the same way..
  await op;

  // the readonly op is also promise, so we can use it in the same way..
  await op.getReadonlyObject();
}
