export type ProgressEventPayload<T> = {
  progress: number;
};
export type CompleteEventPayload<T> = {
  response: T | undefined;
};
export type ErrorEventPayload<T> = {
  error: StatusOpError | null;
};

export interface IStatusOpEventMap<T> {
  progress: CustomEvent<ProgressEventPayload<T>>;
  complete: CustomEvent<CompleteEventPayload<T>>;
  error: CustomEvent<ErrorEventPayload<T>>;
}

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

export type OnCompleteCallback<T> = (response: T, error: StatusOpError) => void;
export type ProcessResponseCallback<T> = (
  response: T,
  error: StatusOpError
) => T | undefined;

export type StatusOpID = string;
export type StatusOpResponse = unknown;
export type StatusOpError = unknown;

export type DirectProgressCallback<T, TSender> = (
  progress: number,
  sender: TSender
) => void;
export type DirectCompleteCallback<T, TSender> = (
  response: T,
  sender: TSender
) => void;
export type DirectErrorCallback<T, TSender> = (
  response: StatusOpError,
  sender: TSender
) => void;

export interface IDirectSignatureMap<T, TSender> {
  on(ev: "progress", handler: DirectProgressCallback<T, TSender>): void;
  on(ev: "complete", handler: DirectCompleteCallback<T, TSender>): void;
  on(ev: "error", handler: DirectErrorCallback<T, TSender>): void;

  off(ev: "progress", handler: DirectProgressCallback<T, TSender>): void;
  off(ev: "complete", handler: DirectCompleteCallback<T, TSender>): void;
  off(ev: "error", handler: DirectErrorCallback<T, TSender>): void;
}

export type OnSignature<T, TSender> = IDirectSignatureMap<T, TSender>["on"];
export type OffSignature<T, TSender> = IDirectSignatureMap<T, TSender>["off"];

export interface IStatusOp<
  T,
  TEventMap extends IStatusOpEventMap<T> = IStatusOpEventMap<T>
> {
  readonly id: StatusOpID;
  readonly on: OnSignature<T, IStatusOp<T, TEventMap>>;
  readonly off: OffSignature<T, IStatusOp<T, TEventMap>>;
  readonly progress: number;
  readonly complete: boolean;
  readonly response: T | null;
  readonly error: StatusOpError | null;

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
  ): Promise<TResult1 | TResult2>;
  catch<TResult = never>(
    onrejected?: (reason: any) => TResult | PromiseLike<TResult>
  ): Promise<T | TResult>;
  finally(onfinally?: () => void): Promise<T>;

  getStatusObject: () => IStatusOpStatus<T, TEventMap>;
  getReadonlyObject: () => IReadonlyStatusOp<T, TEventMap>;
}

export interface IStatusOpStatus<
  T,
  TEventMap extends IStatusOpEventMap<T> = IStatusOpEventMap<T>
> {
  readonly id: StatusOpID;
  readonly on: OnSignature<T, IStatusOpStatus<T, TEventMap>>;
  readonly off: OffSignature<T, IStatusOpStatus<T, TEventMap>>;
  readonly progress: number;
  readonly complete: boolean;
  readonly response: T | null;
  readonly error: StatusOpError | null;
}

export interface IReadonlyStatusOp<
  T,
  TEventMap extends IStatusOpEventMap<T> = IStatusOpEventMap<T>
> {
  readonly id: StatusOpID;
  readonly on: OnSignature<T, IReadonlyStatusOp<T, TEventMap>>;
  readonly off: OffSignature<T, IReadonlyStatusOp<T, TEventMap>>;
  readonly progress: number;
  readonly complete: boolean;
  readonly response: T | null;
  readonly error: StatusOpError | null;

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
  ): Promise<TResult1 | TResult2>;
  catch<TResult = never>(
    onrejected?: (reason: any) => TResult | PromiseLike<TResult>
  ): Promise<T | TResult>;
  finally(onfinally?: () => void): Promise<T>;
}
