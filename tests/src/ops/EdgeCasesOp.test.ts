import { StatusOp } from "@/src/ops/StatusOp";
import type {
  // IReadonlyStatusOp,
  // IStatusOp,
  IStatusOpEventMap,
  IStatusOpOptions,
  // IStatusOpStatus,
  // OffSignature,
  OnCompleteCallback,
  // OnSignature,
  // StatusOpError,
  StatusOpID
} from "@/src/types";

import { genPromiseObj } from "@/src/utils";

describe("explicit base StatusOp edge case tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("invalid constructor (empty)", async () => {
    // @ts-expect-error invalid call but we will ensure it fails correctly
    const op = new MockOp();
    expect(op.progress).toEqual(0);

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("No base promise provided");
    }

    expect(op.error).toEqual("No base promise provided");
  });

  test("invalid constructor (null promise)", async () => {
    const op = new MockOp<number>(null as unknown as Promise<number>);
    expect(op.progress).toEqual(0);

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("No base promise provided");
    }

    expect(op.error).toEqual("No base promise provided");
  });

  test("invalid constructor (null promise in options)", async () => {
    const op = new MockOp({ promise: null as unknown as Promise<number> });
    expect(op.progress).toEqual(0);

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("No base promise provided");
    }

    expect(op.error).toEqual("No base promise provided");
  });

  test("basic testing", async () => {
    const pObj = genPromiseObj<number>();

    const op = new MockOp(pObj.promise);
    expect(op.progress).toEqual(0);

    const mockDirectProgressCallback = jest.fn((x: number) => x);
    const mockDirectCompleteCallback = jest.fn((x: number) => x);
    const mockDirectErrorCallback = jest.fn((e: unknown) => e);

    const mockStatusProgressCallback = jest.fn((x: number) => x);
    const mockStatusCompleteCallback = jest.fn((x: number) => x);
    const mockStatusErrorCallback = jest.fn((e: unknown) => e);

    const mockReadonlyProgressCallback = jest.fn((x: number) => x);
    const mockReadonlyCompleteCallback = jest.fn((x: number) => x);
    const mockReadonlyErrorCallback = jest.fn((e: unknown) => e);

    op.on("complete", mockDirectCompleteCallback);
    op.on("progress", mockDirectProgressCallback);
    op.on("error", mockDirectErrorCallback);

    const opStatus = op.getStatusObject();
    opStatus.on("complete", mockStatusCompleteCallback);
    opStatus.on("progress", mockStatusProgressCallback);
    opStatus.on("error", mockStatusErrorCallback);

    const opReadonly = op.getReadonlyObject();
    opReadonly.on("complete", mockReadonlyCompleteCallback);
    opReadonly.on("progress", mockReadonlyProgressCallback);
    opReadonly.on("error", mockReadonlyErrorCallback);

    expect(op).not.toEqual(opStatus);
    expect(op).not.toEqual(opReadonly);
    expect(opStatus).not.toEqual(opReadonly);

    expect(op.progress).toEqual(0);
    expect(opStatus.progress).toEqual(0);
    expect(opReadonly.progress).toEqual(0);

    op.testUpdateProgress(0.5);

    expect(op.progress).toEqual(0.5);
    expect(opStatus.progress).toEqual(0.5);
    expect(opReadonly.progress).toEqual(0.5);

    pObj.resolve(123);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual(undefined);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.5, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);

    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockDirectCompleteCallback.mock.calls[0]).toEqual([123, op]);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.5, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockStatusCompleteCallback.mock.calls[0]).toEqual([123, opStatus]);

    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.5,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(0);

    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyCompleteCallback.mock.calls[0]).toEqual([
      123,
      opReadonly
    ]);

    let opReadonlyResult = await opReadonly;
    expect(opReadonlyResult).toEqual(123);
  });

  test("basic testing big signature", async () => {
    const pObj = genPromiseObj<number>();

    const mockOnCompleteCallback = jest.fn((x: number | null) => x);

    const op = new MockOp("abc", pObj.promise, mockOnCompleteCallback);
    expect(op.id).toEqual("abc");
    expect(op.progress).toEqual(0);

    const mockDirectProgressCallback = jest.fn((x: number) => x);
    const mockDirectCompleteCallback = jest.fn((x: number) => x);
    const mockDirectErrorCallback = jest.fn((e: unknown) => e);

    const mockStatusProgressCallback = jest.fn((x: number) => x);
    const mockStatusCompleteCallback = jest.fn((x: number) => x);
    const mockStatusErrorCallback = jest.fn((e: unknown) => e);

    const mockReadonlyProgressCallback = jest.fn((x: number) => x);
    const mockReadonlyCompleteCallback = jest.fn((x: number) => x);
    const mockReadonlyErrorCallback = jest.fn((e: unknown) => e);

    op.on("complete", mockDirectCompleteCallback);
    op.on("progress", mockDirectProgressCallback);
    op.on("error", mockDirectErrorCallback);

    const opStatus = op.getStatusObject();
    opStatus.on("complete", mockStatusCompleteCallback);
    opStatus.on("progress", mockStatusProgressCallback);
    opStatus.on("error", mockStatusErrorCallback);

    const opReadonly = op.getReadonlyObject();
    opReadonly.on("complete", mockReadonlyCompleteCallback);
    opReadonly.on("progress", mockReadonlyProgressCallback);
    opReadonly.on("error", mockReadonlyErrorCallback);

    expect(op).not.toEqual(opStatus);
    expect(op).not.toEqual(opReadonly);
    expect(opStatus).not.toEqual(opReadonly);

    expect(op.progress).toEqual(0);
    expect(opStatus.progress).toEqual(0);
    expect(opReadonly.progress).toEqual(0);

    op.testUpdateProgress(0.5);

    expect(op.progress).toEqual(0.5);
    expect(opStatus.progress).toEqual(0.5);
    expect(opReadonly.progress).toEqual(0.5);

    pObj.resolve(123);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual(undefined);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    expect(mockOnCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockOnCompleteCallback.mock.calls[0]).toEqual([123, null]);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.5, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);

    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockDirectCompleteCallback.mock.calls[0]).toEqual([123, op]);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.5, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockStatusCompleteCallback.mock.calls[0]).toEqual([123, opStatus]);

    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.5,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(0);

    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyCompleteCallback.mock.calls[0]).toEqual([
      123,
      opReadonly
    ]);

    let opReadonlyResult = await opReadonly;
    expect(opReadonlyResult).toEqual(123);
  });

  test("basic testing onComplete signature", async () => {
    const pObj = genPromiseObj<number>();

    const mockOnCompleteCallback = jest.fn((x: number | null) => x);

    const op = new MockOp(pObj.promise, mockOnCompleteCallback);
    expect(op.progress).toEqual(0);

    const mockDirectProgressCallback = jest.fn((x: number) => x);
    const mockDirectCompleteCallback = jest.fn((x: number) => x);
    const mockDirectErrorCallback = jest.fn((e: unknown) => e);

    const mockStatusProgressCallback = jest.fn((x: number) => x);
    const mockStatusCompleteCallback = jest.fn((x: number) => x);
    const mockStatusErrorCallback = jest.fn((e: unknown) => e);

    const mockReadonlyProgressCallback = jest.fn((x: number) => x);
    const mockReadonlyCompleteCallback = jest.fn((x: number) => x);
    const mockReadonlyErrorCallback = jest.fn((e: unknown) => e);

    op.on("complete", mockDirectCompleteCallback);
    op.on("progress", mockDirectProgressCallback);
    op.on("error", mockDirectErrorCallback);

    const opStatus = op.getStatusObject();
    opStatus.on("complete", mockStatusCompleteCallback);
    opStatus.on("progress", mockStatusProgressCallback);
    opStatus.on("error", mockStatusErrorCallback);

    const opReadonly = op.getReadonlyObject();
    opReadonly.on("complete", mockReadonlyCompleteCallback);
    opReadonly.on("progress", mockReadonlyProgressCallback);
    opReadonly.on("error", mockReadonlyErrorCallback);

    expect(op).not.toEqual(opStatus);
    expect(op).not.toEqual(opReadonly);
    expect(opStatus).not.toEqual(opReadonly);

    expect(op.progress).toEqual(0);
    expect(opStatus.progress).toEqual(0);
    expect(opReadonly.progress).toEqual(0);

    op.testUpdateProgress(0.5);

    expect(op.progress).toEqual(0.5);
    expect(opStatus.progress).toEqual(0.5);
    expect(opReadonly.progress).toEqual(0.5);

    pObj.resolve(123);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual(undefined);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    expect(mockOnCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockOnCompleteCallback.mock.calls[0]).toEqual([123, null]);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.5, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);

    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockDirectCompleteCallback.mock.calls[0]).toEqual([123, op]);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.5, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockStatusCompleteCallback.mock.calls[0]).toEqual([123, opStatus]);

    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.5,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(0);

    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyCompleteCallback.mock.calls[0]).toEqual([
      123,
      opReadonly
    ]);

    let opReadonlyResult = await opReadonly;
    expect(opReadonlyResult).toEqual(123);
  });
});

export class MockOp<
  T,
  TEventMap extends IStatusOpEventMap<T> = IStatusOpEventMap<T>
> extends StatusOp<T, TEventMap> {
  testUpdateProgress(to: number, silent?: boolean) {
    this._updateProgress(to, silent);
  }

  _generateOnHandler(
    eventName: keyof TEventMap,
    callback: Function
  ): Function | undefined {
    return super._generateOnHandler(eventName, callback);
  }
}
export class MockOpOrig<T> extends StatusOp<T> {
  constructor(promise: Promise<T>);
  constructor(promise: Promise<T>, onComplete: OnCompleteCallback<T>);
  constructor(
    reqID: StatusOpID,
    promise: Promise<T>,
    onComplete: OnCompleteCallback<T>
  );
  constructor(options: IStatusOpOptions<T>);
  // @ts-expect-error
  constructor(...args) {
    // @ts-expect-error
    super(...args);
  }
}
