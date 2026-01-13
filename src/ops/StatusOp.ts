import type {
  IPromiseLike,
  IReadonlyStatusOp,
  IStatusOp,
  IStatusOpEventMap,
  IStatusOpOptions,
  IStatusOpStatus,
  OffSignature,
  OnCompleteCallback,
  OnSignature,
  StatusOpError,
  StatusOpID
} from "@/src/types";

import {
  defineGetter,
  generateRandomID,
  genPromiseObj,
  isPromiseLike
} from "@/src/utils";

export abstract class StatusOp<
    T,
    TEventMap extends IStatusOpEventMap<T> = IStatusOpEventMap<T>
  >
  extends EventTarget
  implements IStatusOp<T, TEventMap>, IPromiseLike<T>
{
  // easy access to reported info properties
  readonly id!: StatusOpID;
  readonly on!: OnSignature<T, this>;
  readonly off!: OffSignature<T, this>;
  readonly progress!: number;
  readonly complete!: boolean;
  readonly response!: T | null;
  readonly error!: StatusOpError | null;

  constructor(promise: Promise<T>);
  constructor(promise: Promise<T>, onComplete: OnCompleteCallback<T>);
  constructor(
    reqID: StatusOpID,
    promise: Promise<T>,
    onComplete: OnCompleteCallback<T>
  );
  constructor(options: IStatusOpOptions<T>);
  constructor() {
    super();

    let options: IStatusOpOptions<T>;

    if (arguments.length > 2) {
      // called in format (reqID, promise, onComplete)
      options = {
        id: arguments[0],
        promise: arguments[1],
        onComplete: arguments[2]
      };
    } else if (arguments.length === 2) {
      // called in format (promise, onComplete)
      options = {
        promise: arguments[0],
        onComplete: arguments[1]
      };
    } else {
      if (isPromiseLike<T>(arguments[0])) {
        // called in format (promise)
        options = {
          promise: arguments[0]
        };
      } else {
        // called in format (options)
        options = arguments[0] || {};
      }
    }

    let _progress = 0;
    let _complete = false;
    let _response: T | undefined = undefined;
    let _error: StatusOpError | undefined = undefined;

    const _reqID = options.id || generateRandomID();
    const _processCallback = options.processCallback || null;

    const _basePromise =
      options.promise || Promise.reject("No base promise provided");
    const _rootPromiseObj = genPromiseObj<T>();

    const _manualCallbacks: {
      eventName: keyof TEventMap;
      mappedHandler: Function;
      callback: Function;
    }[] = [];

    const thisRef = this;

    const _then = _rootPromiseObj.promise.then.bind(_rootPromiseObj.promise);
    const _catch = _rootPromiseObj.promise.catch.bind(_rootPromiseObj.promise);
    const _finally = _rootPromiseObj.promise.finally.bind(
      _rootPromiseObj.promise
    );

    // generate an info property that callers can query for info
    const _reportedInfo: IStatusOpStatus<T, TEventMap> = {
      get id() {
        return _reqID;
      },
      get on() {
        return thisRef.on;
      },
      get off() {
        return thisRef.off;
      },
      get progress() {
        return _progress || 0;
      },
      get complete() {
        return _complete;
      },
      get response() {
        return _response || null;
      },
      get error() {
        return _error;
      }
    };

    // -----
    defineGetter(this, "id", () => _reportedInfo.id);
    defineGetter(this, "progress", () => _reportedInfo.progress);
    defineGetter(this, "complete", () => _reportedInfo.complete);
    defineGetter(this, "response", () => _reportedInfo.response);
    defineGetter(this, "error", () => _reportedInfo.error);

    this.then = _then;
    this.catch = _catch;
    this.finally = _finally;
    this.on = function (eventName: keyof TEventMap, callback: Function) {
      if (!callback) {
        return;
      }

      const manualCallback = thisRef._generateOnHandler.apply(
        thisRef,
        arguments as unknown as [eventName: keyof TEventMap, callback: Function]
      );
      if (manualCallback) {
        _manualCallbacks.push({
          eventName,
          mappedHandler: manualCallback as Function,
          callback
        });
        thisRef.addEventListener(
          eventName,
          manualCallback as (ev: TEventMap[keyof TEventMap]) => void
        );
        return;
      }

      const handlerContext = this;
      switch (eventName) {
        case "progress": {
          const mappedHandler = function (ev: TEventMap["progress"]) {
            callback(ev.detail.progress, handlerContext);
          };
          _manualCallbacks.push({ eventName, mappedHandler, callback });
          thisRef.addEventListener("progress", mappedHandler);
          break;
        }
        case "error": {
          const mappedHandler = function (ev: TEventMap["error"]) {
            callback(ev.detail.error, handlerContext);
          };
          _manualCallbacks.push({ eventName, mappedHandler, callback });
          thisRef.addEventListener("error", mappedHandler);
          break;
        }
        case "complete": {
          const mappedHandler = function (ev: TEventMap["complete"]) {
            callback(ev.detail.response, handlerContext);
          };
          _manualCallbacks.push({ eventName, mappedHandler, callback });
          thisRef.addEventListener("complete", mappedHandler);
          break;
        }
      }
    };
    this.off = function (eventName: keyof TEventMap, callback: Function) {
      if (!callback) {
        return;
      }

      const relIndex = _manualCallbacks.findIndex(
        m => m.callback === callback && m.eventName === eventName
      );

      if (relIndex === -1) {
        return;
      }

      const relMap = _manualCallbacks.splice(relIndex, 1)[0];

      const relHandler = relMap.mappedHandler as (
        ev: TEventMap[keyof TEventMap]
      ) => void;

      thisRef.removeEventListener(eventName, relHandler);
    };

    this.getStatusObject = () => _reportedInfo;
    this.getReadonlyObject = () => {
      const ret: IReadonlyStatusOp<T, TEventMap> = {
        get id() {
          return _reqID;
        },
        get on() {
          return thisRef.on;
        },
        get off() {
          return thisRef.off;
        },
        get progress() {
          return _progress || 0;
        },
        get complete() {
          return _complete;
        },
        get response() {
          return _response || null;
        },
        get error() {
          return _error;
        },
        get then() {
          return _then;
        },
        get catch() {
          return _catch;
        },
        get finally() {
          return _finally;
        }
      };
      return ret;
    };

    this._updateProgress = function (to: number, silent?: boolean) {
      if (_complete) {
        throw "Already completed";
      }

      _progress = to || 0;

      silent = silent ?? false;
      if (!silent) {
        this.dispatchEvent(
          new CustomEvent("progress", {
            detail: {
              progress: _progress,
              op: _reportedInfo
            }
          })
        );
      }
    };

    function _handleCompletion(
      rsp: T | undefined,
      error: StatusOpError | null
    ) {
      if (_complete) {
        throw "Already completed";
      }

      if (rsp !== undefined) {
        try {
          if (_processCallback) {
            let processedResponse = _processCallback(rsp, error);
            if (processedResponse !== undefined) {
              rsp = processedResponse;
            }
          }
        } catch (processingError) {
          rsp = undefined;
          error = error || processingError || "Unknown error occurred";
        }
      }

      _progress = 1;
      _complete = true;

      if (!error) {
        _response = rsp;

        thisRef.dispatchEvent(
          new CustomEvent("complete", {
            detail: {
              response: _response,
              op: _reportedInfo
            }
          })
        );

        _rootPromiseObj.resolve(_response);
        return;
      }

      if (rsp) {
        _response = rsp;
      }

      _error = error;

      thisRef.dispatchEvent(
        new CustomEvent("error", {
          detail: {
            error: _error,
            op: _reportedInfo
          }
        })
      );
      _rootPromiseObj.reject(_error);
    }

    if (options.onComplete) {
      this.on("complete", options.onComplete);
    }

    _basePromise.catch(e => {
      _handleCompletion(undefined, e);
    });
    _basePromise
      .then(v => {
        _handleCompletion(v, null);
      })
      .catch(e => {});
  }

  getStatusObject: () => IStatusOpStatus<T, TEventMap>;
  getReadonlyObject: () => IReadonlyStatusOp<T, TEventMap>;

  then: (
    onfulfilled?: ((value: T) => unknown) | null | undefined,
    onrejected?: ((reason: any) => unknown) | null | undefined
  ) => Promise<unknown>;
  catch: (
    onrejected?: ((reason: any) => unknown) | null | undefined
  ) => Promise<unknown>;
  finally: (onfinally?: (() => void) | null | undefined) => Promise<T>;

  protected _updateProgress: (to: number, silent?: boolean) => void;

  protected _generateOnHandler(
    eventName: keyof TEventMap,
    callback: Function
  ): Function | undefined {
    return undefined;
  }

  // @ts-expect-error manual override of addEventListener for explicit event types
  addEventListener<T extends keyof TEventMap>(
    // the event name, a key of TEventMap
    type: T,
    listener:
      | ((ev: TEventMap[T]) => void)
      | { handleEvent: (ev: TEventMap[T]) => void }
      | null,
    options?: boolean | AddEventListenerOptions
  ): void;

  // @ts-expect-error manual override of addEventListener for explicit event types
  removeEventListener<T extends keyof TEventMap>(
    // the event name, a key of TEventMap
    type: T,
    listener:
      | ((ev: TEventMap[T]) => void)
      | { handleEvent: (ev: TEventMap[T]) => void }
      | null,
    options?: boolean | AddEventListenerOptions
  ): void;
}

export default StatusOp;
