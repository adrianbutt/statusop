import type { EventMapDef, DefaultEventMap } from "@/src/types";

import { genPromiseObj } from "@/src/utils";
import { StatusOp } from "@/src/ops/StatusOp";

export type StandardStatusOpStartMode =
  // starts the op automatically after the next js event loop
  | "auto"
  // starts the op immediately (before the subclass instance is initialised)
  | "immediate"
  // class is expected to manually start the op (via _startOp call)
  | "manual";
export abstract class StandardStatusOp<
  T,
  TEventMap extends EventMapDef<TEventMap> = DefaultEventMap
> extends StatusOp<T, TEventMap> {
  constructor();
  constructor(autoStart: boolean);
  constructor(startMode: StandardStatusOpStartMode);
  constructor() {
    let startMode: StandardStatusOpStartMode;
    if (arguments.length) {
      if (typeof arguments[0] === "string") {
        startMode = arguments[0] as StandardStatusOpStartMode;
      } else {
        startMode = arguments[0] ? "auto" : "manual";
      }
    } else {
      startMode = "auto";
    }

    const tmpPromiseObj = genPromiseObj<T>();
    super({
      promise: tmpPromiseObj.promise
    });

    this._startOp = function () {
      let toStart: Promise<T>;
      if (startMode === "auto") {
        let thisRef = this;
        toStart = Promise.resolve(null).then(x => thisRef._runLogic());
      } else {
        toStart = this._runLogic();
      }

      toStart
        .then(r => {
          tmpPromiseObj.resolve(r);
        })
        .catch(() => {});
      toStart.catch(e => {
        tmpPromiseObj.reject(e);
      });

      // @ts-expect-error we're removing this
      delete this._startOp;
    };

    switch (startMode) {
      case "manual": {
        break;
      }
      default: {
        this._startOp();
      }
    }
  }

  // if autoStart was enabled in the constructor will be automatically called
  //   NOTE: this means it will be called before the subclass is inited.
  protected abstract _runLogic(): Promise<T>;

  // if autoStart was disabled in the constructor, it will be up
  //   to the user to call this function.
  protected _startOp!: () => void;
}

export default StandardStatusOp;
