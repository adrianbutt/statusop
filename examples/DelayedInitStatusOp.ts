import { DelayedInitStatusOp } from "statusop";
import type { IReadonlyStatusOp, IStatusOpStatus } from "statusop";

type ExampleTaskPayload = {
  data: string;
};

export class ExampleOp extends DelayedInitStatusOp<ExampleTaskPayload> {
  private _strLength: number;
  constructor(strLength: number) {
    super();
    this._strLength = strLength;
  }

  start() {
    if (this.started) {
      throw "Already started!";
    }
    this._setLogic(this._runLogic());
  }

  private async _runLogic() {
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
//

export async function standardExample() {
  // imagine this was some sort of task running in the background...
  const op = new ExampleOp(15);

  // we could listen to progress events like so:
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
  op.on("complete", (response: ExampleTaskPayload, sender: typeof op) => {});
  op.getStatusObject().on(
    "complete",
    (
      response: ExampleTaskPayload,
      sender: IStatusOpStatus<ExampleTaskPayload>
    ) => {}
  );

  // for errors:
  op.on("error", (error: unknown, sender: typeof op) => {});
  op.getStatusObject().on(
    "error",
    (error: unknown, sender: IStatusOpStatus<ExampleTaskPayload>) => {}
  );

  // we need to manually start this op...
  op.start();

  // the op is a promise, so we can use it in the same way..
  await op;

  // the readonly op is also promise, so we can use it in the same way..
  await op.getReadonlyObject();
}
