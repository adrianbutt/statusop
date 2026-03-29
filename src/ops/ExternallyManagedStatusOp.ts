import type {
  IStatusOpOptions,
  EventMapDef,
  DefaultEventMap,
  OnCompleteCallback,
  ProcessResponseCallback,
  StatusOpError,
  StatusOpID
} from "@/src/types";

import { genPromiseObj } from "@/src/utils";
import { StatusOp } from "@/src/ops/StatusOp";

export interface IExternallyManagedStatusOpOptions<T> {
  id?: StatusOpID;
  onComplete?: OnCompleteCallback<T>;
  processCallback?: ProcessResponseCallback<T>;
}

export class ExternallyManagedStatusOp<
  T,
  TEventMap extends EventMapDef<TEventMap> = DefaultEventMap
> extends StatusOp<T, TEventMap> {
  constructor(reqID: StatusOpID);
  constructor(reqID: StatusOpID, onComplete: OnCompleteCallback<T>);
  constructor(options: IExternallyManagedStatusOpOptions<T>);
  constructor();
  constructor() {
    let options: IExternallyManagedStatusOpOptions<T>;
    if (arguments.length > 1) {
      // called in format (reqID, onComplete)
      options = {
        id: arguments[0],
        onComplete: arguments[1]
      };
    } else if (arguments.length === 1) {
      // called in format (reqID)
      if (typeof arguments[0] === "object") {
        // called in format (options)
        options = arguments[0];
      } else {
        // called in format (id)
        options = {
          id: arguments[0]
        };
      }
    } else {
      options = {};
    }

    const { ...rest } = options;

    const basePromiseObj = genPromiseObj<T>();
    const baseOptions: IStatusOpOptions<T> = {
      ...rest,
      promise: basePromiseObj.promise
    };

    super(baseOptions);

    const thisRef = this;
    this.notifyProgress = function (toVal: number, silent?: boolean) {
      thisRef._updateProgress(toVal, silent);
    };

    this.notifyResponseReceived = function (rsp: T | null) {
      if (this.complete) {
        throw "Already completed";
      }
      basePromiseObj.resolve(rsp);
    };
    this.notifyError = function (err: StatusOpError) {
      if (this.complete) {
        throw "Already completed";
      }
      basePromiseObj.reject(err);
    };
  }

  notifyProgress: (toVal: number) => void;

  notifyResponseReceived: (rsp: T | null) => void;
  notifyError: (err: StatusOpError) => void;
}

export default ExternallyManagedStatusOp;
