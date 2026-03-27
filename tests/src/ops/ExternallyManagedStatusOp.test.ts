import { ExternallyManagedStatusOp } from "@/src/ops/ExternallyManagedStatusOp";

describe("standard tests", () => {
  test("basic testing", async () => {
    const op = new ExternallyManagedStatusOp<number>();
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

    op.notifyResponseReceived(987);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(987);
    expect(opResult).toEqual(987);
  });

  test("basic testing with standard events", async () => {
    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const op = new ExternallyManagedStatusOp<number>();

    op.addEventListener("progress", progressEventCallback);
    op.addEventListener("complete", progressCompleteCallback);

    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);

    expect(op.progress).toEqual(0.2);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        progress: 0.2
      })
    );
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    op.notifyResponseReceived(654);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(654);
    expect(opResult).toEqual(654);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        response: 654
      })
    );
  });

  test("basic testing with standard events (with id)", async () => {
    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const op = new ExternallyManagedStatusOp<number>("myop123");

    expect(op.id).toEqual("myop123");

    op.addEventListener("progress", progressEventCallback);
    op.addEventListener("complete", progressCompleteCallback);

    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);

    expect(op.progress).toEqual(0.2);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        progress: 0.2
      })
    );
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    op.notifyResponseReceived(654);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(654);
    expect(opResult).toEqual(654);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        response: 654
      })
    );
  });

  test("basic testing with standard events (with id and callback)", async () => {
    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const mockConstructorCompleteCallback = jest.fn((x: number | null) => x);

    const op = new ExternallyManagedStatusOp<number>(
      "myop",
      mockConstructorCompleteCallback
    );

    expect(op.id).toEqual("myop");

    expect(mockConstructorCompleteCallback.mock.calls).toHaveLength(0);

    op.addEventListener("progress", progressEventCallback);
    op.addEventListener("complete", progressCompleteCallback);

    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);

    expect(op.progress).toEqual(0.2);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        progress: 0.2
      })
    );
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    op.notifyResponseReceived(654);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(654);
    expect(opResult).toEqual(654);

    expect(mockConstructorCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockConstructorCompleteCallback.mock.calls[0]).toEqual([654, null]);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        response: 654
      })
    );
  });

  test("basic testing with direct events", async () => {
    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const op = new ExternallyManagedStatusOp<number>();

    op.on("progress", progressEventCallback);
    op.on("complete", progressCompleteCallback);

    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);

    expect(op.progress).toEqual(0.2);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    op.notifyResponseReceived(654);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(654);
    expect(opResult).toEqual(654);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0]).toEqual([654, op]);
  });

  test("basic testing with direct status events", async () => {
    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const op = new ExternallyManagedStatusOp<number>();

    const opStatus = op.getStatusObject();

    opStatus.on("progress", progressEventCallback);
    opStatus.on("complete", progressCompleteCallback);

    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);

    expect(op.progress).toEqual(0.2);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0]).toEqual([0.2, opStatus]);
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    op.notifyResponseReceived(123);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0]).toEqual([123, opStatus]);
  });

  test("testing we cannot complete ops twice (after successful completion)", async () => {
    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const op = new ExternallyManagedStatusOp<number>();

    op.addEventListener("progress", progressEventCallback);
    op.addEventListener("complete", progressCompleteCallback);

    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);

    expect(op.progress).toEqual(0.2);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        progress: 0.2
      })
    );
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    op.notifyResponseReceived(654);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(654);
    expect(opResult).toEqual(654);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        response: 654
      })
    );

    try {
      op.notifyResponseReceived(123);
    } catch (err) {
      expect(err).toEqual("Already completed");
    }

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(654);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        response: 654
      })
    );

    try {
      op.notifyError("mock error");
    } catch (err) {
      expect(err).toEqual("Already completed");
    }

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(654);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        response: 654
      })
    );
  });

  test("testing we cannot complete ops twice (after error)", async () => {
    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const op = new ExternallyManagedStatusOp<number>();

    op.addEventListener("progress", progressEventCallback);
    op.addEventListener("complete", progressCompleteCallback);

    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);

    expect(op.progress).toEqual(0.2);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0][0].detail).toEqual(
      expect.objectContaining({
        op: op.getStatusObject(),
        progress: 0.2
      })
    );
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    op.notifyError("example error");

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("example error");
    }

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(null);
    expect(op.error).toEqual("example error");

    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    try {
      op.notifyResponseReceived(123);
    } catch (err) {
      expect(err).toEqual("Already completed");
    }

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(null);
    expect(op.error).toEqual("example error");

    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    try {
      op.notifyError("mock error");
    } catch (err) {
      expect(err).toEqual("Already completed");
    }

    expect(op.progress).toEqual(1);
    expect(op.response).toEqual(null);
    expect(op.error).toEqual("example error");

    expect(progressCompleteCallback.mock.calls).toHaveLength(0);
  });

  test("readonly comparisons", async () => {
    const mockProcessCallback = jest.fn(function (x: number) {
      return -x;
    });

    const mockConstructorCompleteCallback = jest.fn((x: number | null) => x);
    const mockDirectProgressCallback = jest.fn((x: number) => x);
    const mockDirectCompleteCallback = jest.fn((x: number) => x);
    const mockDirectErrorCallback = jest.fn((e: unknown) => e);

    const mockStatusProgressCallback = jest.fn((x: number) => x);
    const mockStatusCompleteCallback = jest.fn((x: number) => x);
    const mockStatusErrorCallback = jest.fn((e: unknown) => e);

    const mockReadonlyProgressCallback = jest.fn((x: number) => x);
    const mockReadonlyCompleteCallback = jest.fn((x: number) => x);
    const mockReadonlyErrorCallback = jest.fn((e: unknown) => e);

    const op = new ExternallyManagedStatusOp<number>({
      id: "myop123",
      processCallback: mockProcessCallback,
      onComplete: mockConstructorCompleteCallback
    });
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

    expect(op.id).toEqual("myop123");
    expect(opStatus.id).toEqual("myop123");
    expect(opReadonly.id).toEqual("myop123");
    expect(op.progress).toEqual(0);
    expect(opStatus.progress).toEqual(0);
    expect(opReadonly.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);
    expect(opStatus.progress).toEqual(0.2);
    expect(opReadonly.progress).toEqual(0.2);

    expect(mockProcessCallback.mock.calls).toHaveLength(0);

    expect(mockConstructorCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);
    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.2, opStatus]);
    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.2,
      opReadonly
    ]);
    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(0);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(0);

    op.notifyResponseReceived(123);
    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual(undefined);
    expect(op.response).toEqual(-123);
    expect(opResult).toEqual(-123);

    expect(mockProcessCallback.mock.calls).toHaveLength(1);
    expect(mockProcessCallback.mock.calls[0][0]).toEqual(123);
    expect(mockProcessCallback.mock.calls[0]).toEqual([123, null]);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);

    expect(mockConstructorCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockConstructorCompleteCallback.mock.calls[0]).toEqual([-123, null]);
    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockDirectCompleteCallback.mock.calls[0]).toEqual([-123, op]);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.2, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockStatusCompleteCallback.mock.calls[0]).toEqual([-123, opStatus]);

    expect(mockReadonlyProgressCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyProgressCallback.mock.calls[0]).toEqual([
      0.2,
      opReadonly
    ]);
    expect(mockReadonlyErrorCallback.mock.calls).toHaveLength(0);

    expect(mockReadonlyCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockReadonlyCompleteCallback.mock.calls[0]).toEqual([
      -123,
      opReadonly
    ]);

    let opReadonlyResult = await opReadonly;
    expect(opReadonlyResult).toEqual(-123);
  });
});
