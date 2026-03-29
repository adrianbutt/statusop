import type {
  IReadonlyStatusOp,
  IStatusOp,
  IStatusOpOptions,
  IStatusOpStatus,
  OnCompleteCallback,
  EventPublisherWithSenderOnSignature,
  EventPublisherWithSenderOffSignature,
  EventMapDef,
  DefaultEventMap,
  DefaultStatusOpCallbacks,
  StandardEventMapDef,
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
    TEventMap extends EventMapDef<TEventMap> = DefaultEventMap
  >
  implements IStatusOp<T, TEventMap>, PromiseLike<T>
{
  // easy access to reported info properties
  readonly id!: StatusOpID;
  readonly on!: EventPublisherWithSenderOnSignature<
    T,
    StandardEventMapDef<T, TEventMap>,
    this
  >;
  readonly off!: EventPublisherWithSenderOffSignature<
    T,
    StandardEventMapDef<T, TEventMap>,
    this
  >;
  readonly progress!: number;
  readonly complete!: boolean;
  readonly response!: T | null;
  readonly error!: StatusOpError | null;

  constructor(promise: PromiseLike<T>);
  constructor(promise: PromiseLike<T>, onComplete: OnCompleteCallback<T>);
  constructor(
    reqID: StatusOpID,
    promise: PromiseLike<T>,
    onComplete: OnCompleteCallback<T>
  );
  constructor(options: IStatusOpOptions<T>);
  constructor() {
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

    let _evTarget = new EventTarget();

    const _reqID = options.id || generateRandomID();
    const _processCallback = options.processCallback || null;

    let _basePromise: Promise<T>;
    if (options.promise) {
      if ("catch" in options.promise) {
        _basePromise = options.promise as Promise<T>;
      } else {
        _basePromise = Promise.resolve(options.promise);
      }
    } else {
      _basePromise = Promise.reject("No base promise provided");
    }
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
    this.on = function (
      eventName: keyof StandardEventMapDef<T, TEventMap>,
      callback: Function
    ) {
      if (!callback) {
        return;
      }

      const handlerContext = this;
      const mappedHandler = function (ev: Event) {
        const args = ((ev as CustomEvent<unknown[]>).detail || []).slice();
        args.push(handlerContext);
        callback.apply(null, args);
      };
      _manualCallbacks.push({
        eventName: eventName as unknown as keyof TEventMap,
        mappedHandler,
        callback
      });
      _evTarget.addEventListener(eventName as string, mappedHandler);
      return;
    };
    this.off = function (
      eventName: keyof StandardEventMapDef<T, TEventMap>,
      callback: Function
    ) {
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

      const relHandler = relMap.mappedHandler as (ev: Event) => void;

      _evTarget.removeEventListener(eventName as string, relHandler);
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
        thisRef._fireStandardEvent("progress", [_progress]);
      }
    };
    this.fireEvent = function (
      eventName: keyof TEventMap & string,
      args: unknown[]
    ): void {
      _evTarget.dispatchEvent(
        new CustomEvent(eventName, {
          detail: args
        })
      );
    };
    this._fireStandardEvent = function (
      eventName: keyof DefaultStatusOpCallbacks<T> & string,
      args: unknown[]
    ): void {
      thisRef.fireEvent(
        eventName as keyof TEventMap & string,
        args as Parameters<TEventMap[keyof TEventMap & string]>
      );
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

        thisRef._fireStandardEvent("complete", [_response!]);

        _rootPromiseObj.resolve(_response);
        return;
      }

      _error = error;

      thisRef._fireStandardEvent("error", [_error]);
      _rootPromiseObj.reject(_error);
    }

    if (options.onComplete) {
      const onCompleteCB = options.onComplete;
      (this as StatusOp<T>).on("complete", v => onCompleteCB(v, null));
      (this as StatusOp<T>).on("error", err => onCompleteCB(null, err));
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

  then: Promise<T>["then"];
  catch: Promise<T>["catch"];
  finally: Promise<T>["finally"];

  protected _updateProgress: (to: number, silent?: boolean) => void;

  fireEvent: StandardEventDispatcher<T, TEventMap>["fireEvent"];
  protected _fireStandardEvent: StandardEventDispatcher<T>["_fireStandardEvent"];
}

export default StatusOp;

type StandardEventDispatcher<
  T,
  TEventMap extends EventMapDef<TEventMap> = DefaultEventMap
> = {
  fireEvent<TKey extends keyof TEventMap & string>(
    eventName: TKey,
    args: Parameters<TEventMap[TKey]>
  ): void;
  _fireStandardEvent<TKey extends keyof DefaultStatusOpCallbacks<T> & string>(
    eventName: TKey,
    args: Parameters<DefaultStatusOpCallbacks<T>[TKey]>
  ): void;
};
