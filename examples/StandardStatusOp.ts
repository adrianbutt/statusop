import { StandardStatusOp } from "statusop";
import type {
  IReadonlyStatusOp,
  IStatusOpStatus,
  IStatusOpEventMap,
  CompleteEventPayload,
  ErrorEventPayload,
  ProgressEventPayload
} from "statusop";

type ExampleTaskPayload = {
  data: string;
};

export class ExampleOp extends StandardStatusOp<ExampleTaskPayload> {
  private _strLength: number;
  constructor(strLength: number) {
    super();
    this._strLength = strLength;
  }

  protected async _runLogic() {
    let runNTimes = this._strLength;

    let randomStr = "";

    while (randomStr.length < runNTimes) {
      let p = randomStr.length / runNTimes;
      this._updateProgress(p);

      const letter = await this.generateRandomLetterAfterDelay(100);
      randomStr += letter;
    }

    return {
      data: randomStr
    };
  }

  generateRandomLetterAfterDelay(afterDelayMS: number): Promise<string> {
    return new Promise<string>(resolve => {
      window.setTimeout(function () {
        const lowercaseAsciiStart = 97;
        const letterIndex = Math.floor(Math.random() * 26);
        const letter = String.fromCharCode(lowercaseAsciiStart + letterIndex);
        resolve(letter);
      }, afterDelayMS);
    });
  }
}

export async function standardExample() {
  // imagine this was some sort of task running in the background...
  const op = new ExampleOp(15);

  // we could listen to progress events like so:
  op.addEventListener(
    "progress",
    (ev: IStatusOpEventMap<ExampleTaskPayload>["progress"]) => {
      // target will be the op
    }
  );
  op.addEventListener(
    "progress",
    (ev: CustomEvent<ProgressEventPayload<ExampleTaskPayload>>) => {
      // target will be the op
    }
  );

  // or directly
  op.on("progress", (progress: number) => {});
  op.on("progress", (progress: number, sender: typeof op) => {});

  // if we want restricted access to the op:
  op.getStatusObject().on(
    "progress",
    (progress: number, sender: IStatusOpStatus<ExampleTaskPayload>) => {}
  );
  op.getReadonlyObject().on(
    "progress",
    (progress: number, sender: IReadonlyStatusOp<ExampleTaskPayload>) => {}
  );

  // for completion we could listen to the complete event
  op.addEventListener(
    "complete",
    (ev: IStatusOpEventMap<ExampleTaskPayload>["complete"]) => {
      // target will be the op
    }
  );
  op.addEventListener(
    "complete",
    (ev: CustomEvent<CompleteEventPayload<ExampleTaskPayload>>) => {
      // target will be the op
    }
  );

  op.on("complete", (response: ExampleTaskPayload, sender: typeof op) => {});
  op.getStatusObject().on(
    "complete",
    (
      response: ExampleTaskPayload,
      sender: IStatusOpStatus<ExampleTaskPayload>
    ) => {}
  );

  // for errors:
  op.addEventListener(
    "error",
    (ev: IStatusOpEventMap<ExampleTaskPayload>["error"]) => {
      // target will be the op
    }
  );
  op.addEventListener(
    "error",
    (ev: CustomEvent<ErrorEventPayload<ExampleTaskPayload>>) => {
      // target will be the op
    }
  );
  op.on("error", (response: unknown, sender: typeof op) => {});
  op.getStatusObject().on(
    "error",
    (response: unknown, sender: IStatusOpStatus<ExampleTaskPayload>) => {}
  );

  // the op is a promise, so we can use it in the same way..
  await op;

  // the readonly op is also promise, so we can use it in the same way..
  await op.getReadonlyObject();
}
