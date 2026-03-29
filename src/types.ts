export interface IPromiseObj<T> {
  promise: Promise<T>;
  resolve(value: unknown): void;
  reject(reason?: any): void;
}

export interface IStatusOpOptions<T> {
  promise: PromiseLike<T>;
  id?: StatusOpID;
  onComplete?: OnCompleteCallback<T>;
  processCallback?: ProcessResponseCallback<T>;
}

export type OnCompleteCallback<T> = (
  response: T | null,
  error: StatusOpError
) => void;
export type ProcessResponseCallback<T> = (
  response: T,
  error: StatusOpError
) => T | undefined;

export type StatusOpID = string;
export type StatusOpResponse = unknown;
export type StatusOpError = unknown;

export interface IStatusOp<
  T,
  TEventMap extends EventMapDef<TEventMap> = DefaultEventMap
> {
  readonly id: StatusOpID;
  readonly on: EventPublisherWithSenderOnSignature<
    T,
    StandardEventMapDef<T, TEventMap>,
    IStatusOp<T, TEventMap>
  >;
  readonly off: EventPublisherWithSenderOffSignature<
    T,
    StandardEventMapDef<T, TEventMap>,
    IStatusOp<T, TEventMap>
  >;

  readonly progress: number;
  readonly complete: boolean;
  readonly response: T | null;
  readonly error: StatusOpError | null;

  then: Promise<T>["then"];
  catch: Promise<T>["catch"];
  finally: Promise<T>["finally"];

  getStatusObject: () => IStatusOpStatus<T, TEventMap>;
  getReadonlyObject: () => IReadonlyStatusOp<T, TEventMap>;
}

export interface IStatusOpStatus<
  T,
  TEventMap extends EventMapDef<TEventMap> = DefaultEventMap
> {
  readonly id: StatusOpID;
  readonly on: EventPublisherWithSenderOnSignature<
    T,
    StandardEventMapDef<T, TEventMap>,
    IStatusOpStatus<T, TEventMap>
  >;
  readonly off: EventPublisherWithSenderOffSignature<
    T,
    StandardEventMapDef<T, TEventMap>,
    IStatusOpStatus<T, TEventMap>
  >;
  readonly progress: number;
  readonly complete: boolean;
  readonly response: T | null;
  readonly error: StatusOpError | null;
}

export interface IReadonlyStatusOp<
  T,
  TEventMap extends EventMapDef<TEventMap> = DefaultEventMap
> {
  readonly id: StatusOpID;
  readonly on: EventPublisherWithSenderOnSignature<
    T,
    StandardEventMapDef<T, TEventMap>,
    IReadonlyStatusOp<T, TEventMap>
  >;
  readonly off: EventPublisherWithSenderOffSignature<
    T,
    StandardEventMapDef<T, TEventMap>,
    IReadonlyStatusOp<T, TEventMap>
  >;
  readonly progress: number;
  readonly complete: boolean;
  readonly response: T | null;
  readonly error: StatusOpError | null;

  then: Promise<T>["then"];
  catch: Promise<T>["catch"];
  finally: Promise<T>["finally"];
}

export type EventHandlerCallback = (...args: any) => void;

export type EventMapDef<T> = {
  [key in keyof T]: EventHandlerCallback;
};

export type DefaultEventMap = Record<string, EventHandlerCallback>;

export type StandardEventMapDef<
  T,
  TEventMap extends EventMapDef<TEventMap>
> = TEventMap & DefaultStatusOpCallbacks<T>;

export type DefaultStatusOpCallbacks<T> = {
  progress: (progress: number) => void;
  complete: (response: T) => void;
  error: (response: StatusOpError) => void;
};

export interface EventPublisherWithSender<
  T,
  TEventMap extends EventMapDef<TEventMap>,
  TSender
> {
  on<TKey extends keyof TEventMap & string>(
    eventName: TKey,
    handler: (...args: [...Parameters<TEventMap[TKey]>, TSender]) => void
  ): void;
  off<TKey extends keyof TEventMap & string>(
    eventName: TKey,
    handler: (...args: [...Parameters<TEventMap[TKey]>, TSender]) => void
  ): void;
}

export type EventPublisherWithSenderOnSignature<
  T,
  TEventMap extends EventMapDef<TEventMap>,
  TSender
> = EventPublisherWithSender<T, TEventMap, TSender>["on"];
export type EventPublisherWithSenderOffSignature<
  T,
  TEventMap extends EventMapDef<TEventMap>,
  TSender
> = EventPublisherWithSender<T, TEventMap, TSender>["off"];
