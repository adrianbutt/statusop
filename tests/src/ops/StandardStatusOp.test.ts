import {
  StandardStatusOp,
  StandardStatusOpStartMode
} from "@/src/ops/StandardStatusOp";

describe("standard tests", () => {
  test("basic testing", async () => {
    const op = new MockSuccessOp(123);
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

  test("error testing", async () => {
    const op = new MockErrorOp("mock error");
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

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("mock error");
    }

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual("mock error");
    expect(op.response).toEqual(null);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.5, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(1);
    expect(mockDirectErrorCallback.mock.calls[0]).toEqual(["mock error", op]);

    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.5, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(1);
    expect(mockStatusErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opStatus
    ]);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.5,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opReadonly
    ]);

    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);
  });

  test("basic testing - manual init", async () => {
    const op = new MockDelayedInitSuccessOp(123, "manual");
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

    expect(op.constructorState).toEqual("called-after-super");
  });

  test("error testing - manual init", async () => {
    const op = new MockDelayedInitErrorOp("mock error", "manual");
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

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("mock error");
    }

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual("mock error");
    expect(op.response).toEqual(null);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.5, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(1);
    expect(mockDirectErrorCallback.mock.calls[0]).toEqual(["mock error", op]);

    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.5, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(1);
    expect(mockStatusErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opStatus
    ]);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.5,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opReadonly
    ]);

    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);

    expect(op.constructorState).toEqual("called-after-super");
  });

  test("basic testing - auto init", async () => {
    const op = new MockDelayedInitSuccessOp(123, "auto");
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

    expect(op.constructorState).toEqual("called-after-super");
  });

  test("error testing - auto init", async () => {
    const op = new MockDelayedInitErrorOp("mock error", "auto");
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

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("mock error");
    }

    try {
      await opReadonly;
    } catch (err) {
      expect(err).toEqual("mock error");
    }

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual("mock error");
    expect(op.response).toEqual(null);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.5, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(1);
    expect(mockDirectErrorCallback.mock.calls[0]).toEqual(["mock error", op]);

    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.5, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(1);
    expect(mockStatusErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opStatus
    ]);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.5,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opReadonly
    ]);

    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);

    expect(op.constructorState).toEqual("called-after-super");
  });

  test("basic testing - immediate init", async () => {
    const op = new MockDelayedInitSuccessOp(123, "immediate");
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

    expect(op.constructorState).toEqual("called-before-inited");
  });

  test("error testing - immediate init", async () => {
    const op = new MockDelayedInitErrorOp("mock error", "immediate");
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

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("mock error");
    }

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual("mock error");
    expect(op.response).toEqual(null);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.5, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(1);
    expect(mockDirectErrorCallback.mock.calls[0]).toEqual(["mock error", op]);

    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.5, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(1);
    expect(mockStatusErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opStatus
    ]);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.5,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opReadonly
    ]);

    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);

    expect(op.constructorState).toEqual("called-before-inited");
  });

  test("basic testing - manual init (boolean init)", async () => {
    const op = new MockDelayedInitSuccessOp(123, false);
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

    expect(op.constructorState).toEqual("called-after-super");
  });

  test("error testing - manual init (boolean init)", async () => {
    const op = new MockDelayedInitErrorOp("mock error", false);
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

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("mock error");
    }

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual("mock error");
    expect(op.response).toEqual(null);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.5, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(1);
    expect(mockDirectErrorCallback.mock.calls[0]).toEqual(["mock error", op]);

    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.5, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(1);
    expect(mockStatusErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opStatus
    ]);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.5,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opReadonly
    ]);

    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);

    expect(op.constructorState).toEqual("called-after-super");
  });

  test("basic testing - auto init (boolean init)", async () => {
    const op = new MockDelayedInitSuccessOp(123, true);
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

    expect(op.constructorState).toEqual("called-after-super");
  });

  test("error testing - auto init (boolean init)", async () => {
    const op = new MockDelayedInitErrorOp("mock error", true);
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

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("mock error");
    }

    try {
      await opReadonly;
    } catch (err) {
      expect(err).toEqual("mock error");
    }

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual("mock error");
    expect(op.response).toEqual(null);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.5, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(1);
    expect(mockDirectErrorCallback.mock.calls[0]).toEqual(["mock error", op]);

    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.5, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(1);
    expect(mockStatusErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opStatus
    ]);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.5,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyErrorCallback.mock.calls[0]).toEqual([
      "mock error",
      opReadonly
    ]);

    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);

    expect(op.constructorState).toEqual("called-after-super");
  });

  test("promise signatures", async () => {
    const op = new MockSuccessOp(123);
    expect(op.progress).toEqual(0);
    const opReadonly = op.getReadonlyObject();

    expect(op).not.toEqual(opReadonly);
    expect(op.progress).toEqual(0);
    expect(opReadonly.progress).toEqual(0);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual(undefined);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    let thenPromise: Promise<string>;
    let thenPromiseResult: string;

    thenPromise = op.then(r => `${r}-op`);
    thenPromiseResult = await thenPromise;
    expect(thenPromiseResult).toEqual("123-op");

    thenPromise = opReadonly.then(r => `${r}-opReadonly`);
    thenPromiseResult = await thenPromise;
    expect(thenPromiseResult).toEqual("123-opReadonly");

    const errorOp = new MockErrorOp("mock error");
    const errorOpReadonly = errorOp.getReadonlyObject();

    expect(errorOp).not.toEqual(errorOpReadonly);
    try {
      await errorOp;
    } catch (err) {
      expect(err).toEqual("mock error");
    }
    try {
      await errorOpReadonly;
    } catch (err) {
      expect(err).toEqual("mock error");
    }

    thenPromise = errorOp
      .then(v => `${v}-errorOp`)
      .catch(err => `${err}-errorOp`);
    thenPromiseResult = await thenPromise;
    expect(thenPromiseResult).toEqual("mock error-errorOp");

    thenPromise = errorOpReadonly
      .then(v => `${v}-errorOpReadonly`)
      .catch(err => `${err}-errorOpReadonly`);
    thenPromiseResult = await thenPromise;
    expect(thenPromiseResult).toEqual("mock error-errorOpReadonly");
  });
});

export class MockSuccessOp extends StandardStatusOp<number> {
  private _mockResponse: number;
  constructor(mockResponse: number) {
    super();
    this._mockResponse = mockResponse;
  }

  protected async _runLogic() {
    // imagine this some sort of async processing task..
    await Promise.resolve(null);

    this._updateProgress(0.5);

    // imagine this some sort of async processing task..
    await Promise.resolve(null);

    return this._mockResponse;
  }
}
export class MockErrorOp extends StandardStatusOp<number> {
  private _mockError: string;
  constructor(mockError: string) {
    super();
    this._mockError = mockError;
  }

  protected async _runLogic() {
    // imagine this some sort of async processing task..
    await Promise.resolve(null);

    this._updateProgress(0.5);

    // imagine this some sort of async processing task..
    await Promise.resolve(null);

    throw this._mockError;
    return 1;
  }
}

export class MockDelayedInitSuccessOp extends StandardStatusOp<number> {
  private _mockResponse: number;
  private _cachedConstructorState: string;
  public constructorState!: string;
  constructor(mockResponse: number, startMode: StandardStatusOpStartMode);
  constructor(mockResponse: number, autoStart: boolean);
  constructor(
    mockResponse: number,
    rawStartMode: StandardStatusOpStartMode | boolean
  ) {
    let startMode: StandardStatusOpStartMode;
    if (typeof rawStartMode === "boolean") {
      let autoStart = rawStartMode as boolean;
      startMode = autoStart ? "auto" : "manual";
      super(autoStart);
    } else {
      startMode = rawStartMode;
      super(startMode);
    }

    this._cachedConstructorState = "called-after-super";
    this._mockResponse = mockResponse;

    if (startMode === "manual") {
      this._startOp();
    }
  }

  protected async _runLogic() {
    this.constructorState =
      this._cachedConstructorState || "called-before-inited";

    // imagine this some sort of async processing task..
    await Promise.resolve(null);

    this._updateProgress(0.5);

    // imagine this some sort of async processing task..
    await Promise.resolve(null);

    return this._mockResponse;
  }
}
export class MockDelayedInitErrorOp extends StandardStatusOp<number> {
  private _mockError: string;
  private _cachedConstructorState: string;
  public constructorState!: string;
  constructor(mockError: string, startMode: StandardStatusOpStartMode);
  constructor(mockError: string, autoStart: boolean);
  constructor(
    mockError: string,
    rawStartMode: StandardStatusOpStartMode | boolean
  ) {
    let startMode: StandardStatusOpStartMode;
    if (typeof rawStartMode === "boolean") {
      let autoStart = rawStartMode as boolean;
      startMode = autoStart ? "auto" : "manual";
      super(autoStart);
    } else {
      startMode = rawStartMode;
      super(startMode);
    }

    this._cachedConstructorState = "called-after-super";
    this._mockError = mockError;

    if (startMode === "manual") {
      this._startOp();
    }
  }

  protected async _runLogic() {
    this.constructorState =
      this._cachedConstructorState || "called-before-inited";
    // imagine this some sort of async processing task..
    await Promise.resolve(null);

    this._updateProgress(0.5);

    // imagine this some sort of async processing task..
    await Promise.resolve(null);

    throw this._mockError;
    return 1;
  }
}
