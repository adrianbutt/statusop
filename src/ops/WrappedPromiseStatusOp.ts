import type {
  IStatusOpOptions,
  IPromiseLike,
  OnCompleteCallback,
  StatusOpID
} from "@/src/types";
import { StatusOp } from "@/src/ops/StatusOp";
import { isPromiseLike } from "@/src/utils";

export interface IWrappedPromiseStatusOpOptions<T>
  extends Omit<IStatusOpOptions<T>, "promise"> {
  promise: IPromiseLike<T>;
}
export class WrappedPromiseStatusOp<T> extends StatusOp<T> {
  constructor(promise: IPromiseLike<T>);
  constructor(promise: IPromiseLike<T>, onComplete: OnCompleteCallback<T>);
  constructor(
    reqID: StatusOpID,
    promise: IPromiseLike<T>,
    onComplete: OnCompleteCallback<T>
  );
  constructor(options: IWrappedPromiseStatusOpOptions<T>);
  constructor() {
    let options: IWrappedPromiseStatusOpOptions<T>;
    if (arguments.length > 2) {
      // called in format (reqID, promise, onComplete)
      options = {
        id: arguments[0],
        promise: arguments[1],
        onComplete: arguments[2]
      };
    } else if (arguments.length > 1) {
      // called in format (promise, onComplete)
      options = {
        promise: arguments[0],
        onComplete: arguments[1]
      };
    } else if (arguments.length === 1) {
      if (isPromiseLike<T>(arguments[0])) {
        // called in format (promise)
        options = {
          promise: arguments[0]
        };
      } else {
        // called in format (options)
        if (arguments[0] && isPromiseLike<T>(arguments[0].promise)) {
          options = arguments[0];
        } else {
          options = {
            promise: Promise.reject("No promise provided")
          };
        }
      }
    } else {
      options = {
        promise: Promise.reject("No promise provided")
      };
    }

    const { promise, ...rest } = options;
    let wrappedPromise: Promise<T> = Promise.resolve(promise);

    const baseOptions: IStatusOpOptions<T> = {
      ...rest,
      promise: wrappedPromise
    };

    super(baseOptions);
  }

  notifyProgress(toVal: number, silent?: boolean) {
    this._updateProgress(toVal, silent);
  }
}

export function wrapPromise<T>(
  promise: IPromiseLike<T>
): WrappedPromiseStatusOp<T> {
  const ret = new WrappedPromiseStatusOp<T>(promise);
  return ret;
}

export default WrappedPromiseStatusOp;
