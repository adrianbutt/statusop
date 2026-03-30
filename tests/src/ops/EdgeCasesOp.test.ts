import { StatusOp } from "@/src/ops/StatusOp";
import type { EventMapDef, DefaultEventMap } from "@/src/types";

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

  test("basic testing onComplete signature - with promise like promise", async () => {
    const pObj = genPromiseObj<number>();

    const promiseLike = {
      then: function () {
        return pObj.promise.then.apply(pObj.promise, [
          ...(arguments as unknown as Parameters<PromiseLike<number>["then"]>)
        ]);
      }
    } as unknown as PromiseLike<number>;

    const mockOnCompleteCallback = jest.fn((x: number | null) => x);

    const op = new MockOp(promiseLike, mockOnCompleteCallback);
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

  test("custom events", async () => {
    const pObj = genPromiseObj<number>();

    type CustomEventMap = {
      myStringEvent: (msg: string) => void;
    };

    const op = new MockOp<number, CustomEventMap>(pObj.promise);
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

    const mockDirectMyStringEventCallback = jest.fn();
    const mockStatusMyStringEventCallback = jest.fn();
    const mockReadonlyMyStringEventCallback = jest.fn();

    op.on("myStringEvent", mockDirectMyStringEventCallback);
    op.on("complete", mockDirectCompleteCallback);
    op.on("progress", mockDirectProgressCallback);
    op.on("error", mockDirectErrorCallback);

    const opStatus = op.getStatusObject();
    opStatus.on("myStringEvent", mockStatusMyStringEventCallback);
    opStatus.on("complete", mockStatusCompleteCallback);
    opStatus.on("progress", mockStatusProgressCallback);
    opStatus.on("error", mockStatusErrorCallback);

    const opReadonly = op.getReadonlyObject();
    opReadonly.on("myStringEvent", mockReadonlyMyStringEventCallback);
    opReadonly.on("complete", mockReadonlyCompleteCallback);
    opReadonly.on("progress", mockReadonlyProgressCallback);
    opReadonly.on("error", mockReadonlyErrorCallback);

    expect(op).not.toEqual(opStatus);
    expect(op).not.toEqual(opReadonly);
    expect(opStatus).not.toEqual(opReadonly);

    expect(op.progress).toEqual(0);
    expect(opStatus.progress).toEqual(0);
    expect(opReadonly.progress).toEqual(0);

    expect(mockDirectMyStringEventCallback.mock.calls).toHaveLength(0);
    expect(mockStatusMyStringEventCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyMyStringEventCallback.mock.calls).toHaveLength(0);
    expect(mockDirectProgressCallback.mock.calls).toHaveLength(0);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);
    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockStatusProgressCallback.mock.calls).toHaveLength(0);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);
    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);

    op.fireEvent("myStringEvent", ["abc"]);

    expect(mockDirectMyStringEventCallback.mock.calls).toHaveLength(1);
    expect(mockDirectMyStringEventCallback.mock.calls[0]).toEqual(["abc", op]);
    expect(mockStatusMyStringEventCallback.mock.calls).toHaveLength(1);
    expect(mockStatusMyStringEventCallback.mock.calls[0]).toEqual([
      "abc",
      opStatus
    ]);
    expect(mockReadonlyMyStringEventCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyMyStringEventCallback.mock.calls[0]).toEqual([
      "abc",
      opReadonly
    ]);
    expect(mockDirectProgressCallback.mock.calls).toHaveLength(0);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);
    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockStatusProgressCallback.mock.calls).toHaveLength(0);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);
    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);

    mockDirectMyStringEventCallback.mockClear();
    mockStatusMyStringEventCallback.mockClear();
    mockReadonlyMyStringEventCallback.mockClear();

    op.testUpdateProgress(0.5);

    expect(mockDirectMyStringEventCallback.mock.calls).toHaveLength(0);
    expect(mockStatusMyStringEventCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyMyStringEventCallback.mock.calls).toHaveLength(0);
    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.5, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);
    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.5, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);
    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.5,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);

    expect(op.progress).toEqual(0.5);
    expect(opStatus.progress).toEqual(0.5);
    expect(opReadonly.progress).toEqual(0.5);

    mockDirectProgressCallback.mockClear();
    mockStatusProgressCallback.mockClear();
    mockReadonlyProgressCallback.mockClear();

    pObj.resolve(123);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual(undefined);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    expect(mockDirectMyStringEventCallback.mock.calls).toHaveLength(0);
    expect(mockStatusMyStringEventCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyMyStringEventCallback.mock.calls).toHaveLength(0);
    expect(mockDirectProgressCallback.mock.calls).toHaveLength(0);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);
    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockDirectCompleteCallback.mock.calls[0]).toEqual([123, op]);
    expect(mockStatusProgressCallback.mock.calls).toHaveLength(0);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);
    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockStatusCompleteCallback.mock.calls[0]).toEqual([123, opStatus]);
    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyCompleteCallback.mock.calls[0]).toEqual([
      123,
      opReadonly
    ]);

    mockDirectCompleteCallback.mockClear();
    mockStatusCompleteCallback.mockClear();
    mockReadonlyCompleteCallback.mockClear();

    let opReadonlyResult = await opReadonly;
    expect(opReadonlyResult).toEqual(123);

    op.fireEvent("myStringEvent", ["def"]);

    expect(mockDirectMyStringEventCallback.mock.calls).toHaveLength(1);
    expect(mockDirectMyStringEventCallback.mock.calls[0]).toEqual(["def", op]);
    expect(mockStatusMyStringEventCallback.mock.calls).toHaveLength(1);
    expect(mockStatusMyStringEventCallback.mock.calls[0]).toEqual([
      "def",
      opStatus
    ]);
    expect(mockReadonlyMyStringEventCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyMyStringEventCallback.mock.calls[0]).toEqual([
      "def",
      opReadonly
    ]);
    expect(mockDirectProgressCallback.mock.calls).toHaveLength(0);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);
    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockStatusProgressCallback.mock.calls).toHaveLength(0);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);
    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);
  });

  test("custom event signature typescript checks", async () => {
    const pObj = genPromiseObj<number>();

    type CustomEventMap = {
      myStringEvent: (msg: string) => void;
    };

    const op = new MockOp<number, CustomEventMap>(pObj.promise);
    const opStatus = op.getStatusObject();
    const opReadonly = op.getReadonlyObject();

    const stringFunc = (msg: string) => {};
    const stringFuncOpTarget = (msg: string, sender: typeof op) => {};
    const stringFuncOpStatusTarget = (
      msg: string,
      sender: typeof opStatus
    ) => {};
    const stringFuncOpReadonlyTarget = (
      msg: string,
      sender: typeof opReadonly
    ) => {};
    const numberFunc = (number: number) => {};
    const twoStringsFunc = (a: string, b: string) => {};

    // should be valid
    op.on("myStringEvent", stringFunc);
    opStatus.on("myStringEvent", stringFunc);
    opReadonly.on("myStringEvent", stringFunc);

    op.on("myStringEvent", stringFuncOpTarget);
    opStatus.on("myStringEvent", stringFuncOpStatusTarget);
    opReadonly.on("myStringEvent", stringFuncOpReadonlyTarget);

    // ---- invalid calls
    // @ts-expect-error invalid signature
    op.on("myStringEvent", numberFunc);
    // @ts-expect-error invalid signature
    opStatus.on("myStringEvent", numberFunc);
    // @ts-expect-error invalid signature
    opReadonly.on("myStringEvent", numberFunc);

    // @ts-expect-error invalid signature
    op.on("myStringEvent", twoStringsFunc);
    // @ts-expect-error invalid signature
    opStatus.on("myStringEvent", twoStringsFunc);
    // @ts-expect-error invalid signature
    opReadonly.on("myStringEvent", twoStringsFunc);
  });

  test("setting progress to null should just set to 0", async () => {
    const pObj = genPromiseObj<number>();

    const op = new MockOp(pObj.promise);
    op.testUpdateProgress(null as unknown as number);
    expect(op.progress).toEqual(0);
  });
});

export class MockOp<
  T,
  TEventMap extends EventMapDef<TEventMap> = DefaultEventMap
> extends StatusOp<T, TEventMap> {
  testUpdateProgress(to: number, silent?: boolean) {
    this._updateProgress(to, silent);
  }
}
