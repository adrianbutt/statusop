import { wrapPromise } from "@/src/ops/WrappedPromiseStatusOp";
import { WrappedPromiseStatusOp } from "@/src/ops/WrappedPromiseStatusOp";
import { genPromiseObj } from "@/src/utils";

describe("wrap promise tests", () => {
  test("basic testing", async () => {
    const pObj = genPromiseObj<number>();

    const op = wrapPromise(pObj.promise);
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

    pObj.resolve(987);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.response).toEqual(987);
    expect(opResult).toEqual(987);
  });

  test("basic testing with standard events", async () => {
    const pObj = genPromiseObj<number>();

    // const progressEventCallback = jest.fn(function () {});
    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const op = wrapPromise(pObj.promise);

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

    pObj.resolve(654);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
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

  test("basic testing with direct events", async () => {
    const pObj = genPromiseObj<number>();

    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const op = wrapPromise(pObj.promise);

    op.on("progress", progressEventCallback);
    op.on("complete", progressCompleteCallback);

    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);

    expect(op.progress).toEqual(0.2);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    pObj.resolve(654);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.response).toEqual(654);
    expect(opResult).toEqual(654);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0]).toEqual([654, op]);
  });

  test("basic testing with direct status events", async () => {
    const pObj = genPromiseObj<number>();

    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const op = wrapPromise(pObj.promise);

    const opStatus = op.getStatusObject();

    opStatus.on("progress", progressEventCallback);
    opStatus.on("complete", progressCompleteCallback);

    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);

    expect(op.progress).toEqual(0.2);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0]).toEqual([0.2, opStatus]);
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    pObj.resolve(123);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0]).toEqual([123, opStatus]);
  });

  test("direct events edge cass", async () => {
    const pObj = genPromiseObj<number>();

    const progressEventCallback = jest.fn();
    const progressCompleteCallback = jest.fn();

    const op = wrapPromise(pObj.promise);

    op.on("progress", progressEventCallback);
    op.on("complete", progressCompleteCallback);

    // should silently fail if no callback provided
    op.on("progress", null as unknown as typeof progressEventCallback);

    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);

    expect(op.progress).toEqual(0.2);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    // silent progress update shouldn't raise an events
    op.notifyProgress(0.3, true);

    expect(op.progress).toEqual(0.3);

    expect(progressEventCallback.mock.calls).toHaveLength(1);
    expect(progressEventCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    // non-silent progress update should raise an event
    op.notifyProgress(0.4, false);

    expect(op.progress).toEqual(0.4);

    expect(progressEventCallback.mock.calls).toHaveLength(2);
    expect(progressEventCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(progressEventCallback.mock.calls[1]).toEqual([0.4, op]);
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    // verify unsubscribe
    op.off("progress", progressEventCallback);

    op.notifyProgress(0.6);

    expect(op.progress).toEqual(0.6);

    expect(progressEventCallback.mock.calls).toHaveLength(2);
    expect(progressEventCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(progressEventCallback.mock.calls[1]).toEqual([0.4, op]);
    expect(progressCompleteCallback.mock.calls).toHaveLength(0);

    // should silently fail if no callback provided
    op.off("progress", null as unknown as typeof progressEventCallback);
    // should silently fail if unknown callback provided
    op.off("progress", function () {});

    pObj.resolve(654);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.response).toEqual(654);
    expect(opResult).toEqual(654);

    expect(progressCompleteCallback.mock.calls).toHaveLength(1);
    expect(progressCompleteCallback.mock.calls[0]).toEqual([654, op]);
  });

  test("invalid wrapPromise testing (empty)", async () => {
    // @ts-expect-error invalid call but we will ensure it fails correctly
    const op = wrapPromise();
    expect(op.progress).toEqual(0);

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("No promise provided");
    }

    expect(op.error).toEqual("No promise provided");
  });

  test("invalid wrapPromise testing (null)", async () => {
    // @ts-expect-error invalid call but we will ensure it fails correctly
    const op = wrapPromise();
    expect(op.progress).toEqual(0);

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("No promise provided");
    }

    expect(op.error).toEqual("No promise provided");
  });
});

describe("explicit WrappedPromiseStatusOp tests", () => {
  test("full constructor", async () => {
    const pObj = genPromiseObj<number>();

    const mockCompleteCallback = jest.fn((x: number | null) => x);

    const op = new WrappedPromiseStatusOp(
      "myop123",
      pObj.promise,
      mockCompleteCallback
    );
    expect(op.id).toEqual("myop123");
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

    expect(mockCompleteCallback.mock.calls).toHaveLength(0);

    pObj.resolve(123);
    let opResult = await op;
    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    expect(mockCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockCompleteCallback.mock.calls[0][0]).toEqual(123);
    expect(mockCompleteCallback.mock.calls[0]).toEqual([123, null]);
  });

  test("promise + oncomplete constructor", async () => {
    const pObj = genPromiseObj<number>();

    const mockCompleteCallback = jest.fn((x: number | null) => x);

    const op = new WrappedPromiseStatusOp(pObj.promise, mockCompleteCallback);
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

    expect(mockCompleteCallback.mock.calls).toHaveLength(0);

    pObj.resolve(123);
    let opResult = await op;
    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    expect(mockCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockCompleteCallback.mock.calls[0][0]).toEqual(123);
    expect(mockCompleteCallback.mock.calls[0]).toEqual([123, null]);
  });

  test("options constructor", async () => {
    const pObj = genPromiseObj<number>();

    const mockCompleteCallback = jest.fn((x: number | null) => x);

    const op = new WrappedPromiseStatusOp({
      id: "myop123",
      promise: pObj.promise,
      onComplete: mockCompleteCallback
    });
    expect(op.id).toEqual("myop123");
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

    expect(mockCompleteCallback.mock.calls).toHaveLength(0);

    pObj.resolve(123);
    let opResult = await op;
    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    expect(mockCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockCompleteCallback.mock.calls[0][0]).toEqual(123);
    expect(mockCompleteCallback.mock.calls[0]).toEqual([123, null]);
  });

  test("full options constructor", async () => {
    const pObj = genPromiseObj<number>();

    const mockCompleteCallback = jest.fn((x: number | null) => x);
    const mockProcessCallback = jest.fn((x: number) => -x);

    const op = new WrappedPromiseStatusOp({
      id: "myop123",
      promise: pObj.promise,
      processCallback: mockProcessCallback,
      onComplete: mockCompleteCallback
    });
    expect(op.id).toEqual("myop123");
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

    expect(mockProcessCallback.mock.calls).toHaveLength(0);
    expect(mockCompleteCallback.mock.calls).toHaveLength(0);

    pObj.resolve(123);
    let opResult = await op;
    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.response).toEqual(-123);
    expect(opResult).toEqual(-123);

    expect(mockProcessCallback.mock.calls).toHaveLength(1);
    expect(mockProcessCallback.mock.calls[0][0]).toEqual(123);
    expect(mockProcessCallback.mock.calls[0]).toEqual([123, null]);

    expect(mockCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockCompleteCallback.mock.calls[0][0]).toEqual(-123);
    expect(mockCompleteCallback.mock.calls[0]).toEqual([-123, null]);
  });

  test("promise + oncomplete options constructor", async () => {
    const pObj = genPromiseObj<number>();

    const mockCompleteCallback = jest.fn((x: number | null) => x);

    const op = new WrappedPromiseStatusOp({
      promise: pObj.promise,
      onComplete: mockCompleteCallback
    });
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

    expect(mockCompleteCallback.mock.calls).toHaveLength(0);

    pObj.resolve(123);
    let opResult = await op;
    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.response).toEqual(123);
    expect(opResult).toEqual(123);

    expect(mockCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockCompleteCallback.mock.calls[0][0]).toEqual(123);
    expect(mockCompleteCallback.mock.calls[0]).toEqual([123, null]);
  });

  test("invalid constructor (empty)", async () => {
    // @ts-expect-error invalid call but we will ensure it fails correctly
    const op = new WrappedPromiseStatusOp();
    expect(op.progress).toEqual(0);

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("No promise provided");
    }

    expect(op.error).toEqual("No promise provided");
  });

  test("invalid constructor (null promise)", async () => {
    // @ts-expect-error invalid call but we will ensure it fails correctly
    const op = new WrappedPromiseStatusOp(null);
    expect(op.progress).toEqual(0);

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("No promise provided");
    }

    expect(op.error).toEqual("No promise provided");
  });

  test("invalid constructor (null promise in options)", async () => {
    // @ts-expect-error invalid call but we will ensure it fails correctly
    const op = new WrappedPromiseStatusOp({ promise: null });
    expect(op.progress).toEqual(0);

    try {
      await op;
    } catch (err) {
      expect(err).toEqual("No promise provided");
    }

    expect(op.error).toEqual("No promise provided");
  });

  test("events processing", async () => {
    const pObj = genPromiseObj<number>();

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

    const op = new WrappedPromiseStatusOp({
      id: "myop123",
      promise: pObj.promise,
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

    expect(op.id).toEqual("myop123");
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

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

    try {
      pObj.resolve(123);
      await op;
    } catch {}

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual(undefined);
    expect(op.response).toEqual(-123);

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
  });

  test("events processing failure", async () => {
    const pObj = genPromiseObj<number>();

    const mockProcessCallback = jest.fn(function (x: number) {
      throw "example process error";
    });

    const mockConstructorCompleteCallback = jest.fn((x: number | null) => x);
    const mockDirectProgressCallback = jest.fn((x: number) => x);
    const mockDirectCompleteCallback = jest.fn((x: number) => x);
    const mockDirectErrorCallback = jest.fn((e: unknown) => e);

    const mockStatusProgressCallback = jest.fn((x: number) => x);
    const mockStatusCompleteCallback = jest.fn((x: number | null) => x);
    const mockStatusErrorCallback = jest.fn((e: unknown) => e);

    const op = new WrappedPromiseStatusOp({
      id: "myop123",
      promise: pObj.promise,
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

    expect(op.id).toEqual("myop123");
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

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

    try {
      pObj.resolve(123);
      await op;
    } catch {}

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual("example process error");
    expect(op.response).toEqual(null);

    expect(mockProcessCallback.mock.calls).toHaveLength(1);
    expect(mockProcessCallback.mock.calls[0][0]).toEqual(123);
    expect(mockProcessCallback.mock.calls[0]).toEqual([123, null]);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(1);
    expect(mockDirectErrorCallback.mock.calls[0][0]).toEqual(
      "example process error"
    );
    expect(mockDirectErrorCallback.mock.calls[0]).toEqual([
      "example process error",
      op
    ]);

    expect(mockConstructorCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockConstructorCompleteCallback.mock.calls[0]).toEqual([
      null,
      "example process error"
    ]);
    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.2, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(1);
    expect(mockStatusErrorCallback.mock.calls[0][0]).toEqual(
      "example process error"
    );
    expect(mockStatusErrorCallback.mock.calls[0]).toEqual([
      "example process error",
      opStatus
    ]);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);
  });

  test("events processing - unsubscribe", async () => {
    const pObj = genPromiseObj<number>();

    const mockProcessCallback = jest.fn(function (x: number) {
      return -x;
    });

    const mockConstructorCompleteCallback = jest.fn((x: number | null) => x);
    const mockDirectProgressCallback = jest.fn((x: number) => x);
    const mockDirectCompleteCallback = jest.fn((x: number) => x);
    const mockDirectErrorCallback = jest.fn((e: unknown) => e);

    const mockStatusProgressCallback = jest.fn((x: number) => x);
    const mockStatusCompleteCallback = jest.fn((x: number | null) => x);
    const mockStatusErrorCallback = jest.fn((e: unknown) => e);

    const op = new WrappedPromiseStatusOp({
      id: "myop123",
      promise: pObj.promise,
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

    expect(op.id).toEqual("myop123");
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

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

    // unsubscribe
    op.off("complete", mockDirectCompleteCallback);
    op.off("progress", mockDirectProgressCallback);
    op.off("error", mockDirectErrorCallback);
    opStatus.off("complete", mockStatusCompleteCallback);
    opStatus.off("progress", mockStatusProgressCallback);
    opStatus.off("error", mockStatusErrorCallback);

    // unsubscribing should not call any of the callbacks
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

    // update progress
    op.notifyProgress(0.4);
    expect(op.progress).toEqual(0.4);

    // should have been no updates
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

    try {
      pObj.resolve(123);
      await op;
    } catch {}

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual(undefined);
    expect(op.response).toEqual(-123);

    expect(mockProcessCallback.mock.calls).toHaveLength(1);
    expect(mockProcessCallback.mock.calls[0][0]).toEqual(123);
    expect(mockProcessCallback.mock.calls[0]).toEqual([123, null]);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);

    expect(mockConstructorCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockConstructorCompleteCallback.mock.calls[0]).toEqual([-123, null]);
    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.2, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);
  });

  test("events processing failure - unsubscribe", async () => {
    const pObj = genPromiseObj<number>();

    const mockProcessCallback = jest.fn(function (x: number) {
      throw "example process error";
    });

    const mockConstructorCompleteCallback = jest.fn((x: number | null) => x);
    const mockDirectProgressCallback = jest.fn((x: number) => x);
    const mockDirectCompleteCallback = jest.fn((x: number) => x);
    const mockDirectErrorCallback = jest.fn((e: unknown) => e);

    const mockStatusProgressCallback = jest.fn((x: number) => x);
    const mockStatusCompleteCallback = jest.fn((x: number | null) => x);
    const mockStatusErrorCallback = jest.fn((e: unknown) => e);

    const op = new WrappedPromiseStatusOp({
      id: "myop123",
      promise: pObj.promise,
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

    expect(op.id).toEqual("myop123");
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

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

    // unsubscribe
    op.off("complete", mockDirectCompleteCallback);
    op.off("progress", mockDirectProgressCallback);
    op.off("error", mockDirectErrorCallback);
    opStatus.off("complete", mockStatusCompleteCallback);
    opStatus.off("progress", mockStatusProgressCallback);
    opStatus.off("error", mockStatusErrorCallback);

    // unsubscribing should not call any of the callbacks
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

    // update progress
    op.notifyProgress(0.4);
    expect(op.progress).toEqual(0.4);

    // should have been no updates
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

    try {
      pObj.resolve(123);
      await op;
    } catch {}

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual("example process error");
    expect(op.response).toEqual(null);

    expect(mockProcessCallback.mock.calls).toHaveLength(1);
    expect(mockProcessCallback.mock.calls[0][0]).toEqual(123);
    expect(mockProcessCallback.mock.calls[0]).toEqual([123, null]);

    expect(mockDirectProgressCallback.mock.calls).toHaveLength(1);
    expect(mockDirectProgressCallback.mock.calls[0]).toEqual([0.2, op]);
    expect(mockDirectErrorCallback.mock.calls).toHaveLength(0);

    expect(mockConstructorCompleteCallback.mock.calls).toHaveLength(1);
    expect(mockConstructorCompleteCallback.mock.calls[0]).toEqual([
      null,
      "example process error"
    ]);
    expect(mockDirectCompleteCallback.mock.calls).toHaveLength(0);

    expect(mockStatusProgressCallback.mock.calls).toHaveLength(1);
    expect(mockStatusProgressCallback.mock.calls[0]).toEqual([0.2, opStatus]);
    expect(mockStatusErrorCallback.mock.calls).toHaveLength(0);

    expect(mockStatusCompleteCallback.mock.calls).toHaveLength(0);
  });

  test("events processing readonly", async () => {
    const pObj = genPromiseObj<number>();

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
    const mockReadonlyCompleteCallback = jest.fn((x: number | null) => x);
    const mockReadonlyErrorCallback = jest.fn((e: unknown) => e);

    const op = new WrappedPromiseStatusOp({
      id: "myop123",
      promise: pObj.promise,
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

    expect(op.id).toEqual("myop123");
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

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

    try {
      pObj.resolve(123);
      await op;
    } catch {}

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual(undefined);
    expect(op.response).toEqual(-123);

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

describe("usage tests", () => {
  test("setting properties after completion", async () => {
    const pObj = genPromiseObj<number>();

    const op = wrapPromise(pObj.promise);
    expect(op.progress).toEqual(0);

    op.notifyProgress(0.2);
    expect(op.progress).toEqual(0.2);

    pObj.resolve(987);

    let opResult = await op;

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.response).toEqual(987);
    expect(opResult).toEqual(987);

    try {
      op.notifyProgress(0.2);
    } catch (err) {
      expect(err).toEqual("Already completed");
    }
    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
  });

  test("readonly comparisons", async () => {
    const pObj = genPromiseObj<number>();

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
    const mockReadonlyCompleteCallback = jest.fn((x: number | null) => x);
    const mockReadonlyErrorCallback = jest.fn((e: unknown) => e);

    const op = new WrappedPromiseStatusOp({
      id: "myop123",
      promise: pObj.promise,
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

    try {
      pObj.resolve(123);
      await op;
    } catch {}

    expect(op.progress).toEqual(1);
    expect(op.complete).toEqual(true);
    expect(op.error).toEqual(undefined);
    expect(op.response).toEqual(-123);

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
  });
});
