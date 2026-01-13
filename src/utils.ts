import type { IPromiseLike, IPromiseObj } from "@/src/types";

export function isPromiseLike<T>(val: any): val is IPromiseLike<T> {
  if (!val) {
    return false;
  }
  return "then" in val && "catch" in val;
}

export function genPromiseObj<T>() {
  // NOTE: we'll assign directly afterwards
  const p = {} as unknown as IPromiseObj<T>;
  p.promise = new Promise<T>(function (resolve, reject) {
    p.resolve = resolve;
    p.reject = reject;
  });
  return p;
}

export function generateRandomID() {
  // generate a uuidv4 like id (not secure)
  let a = performGeneratePseudoRandomID(8);
  let b = performGeneratePseudoRandomID(4);
  let c = performGeneratePseudoRandomID(4);
  let d = performGeneratePseudoRandomID(4);
  let e = performGeneratePseudoRandomID(12);

  return `${a}-${b}-${c}-${d}-${e}`;
}
function performGeneratePseudoRandomID(length: number): string {
  let id = Math.floor(Math.random() * Math.pow(10, length))
    .toString(16)
    .padStart(length, "0");

  return id;
}

export function defineGetter<T>(
  onObj: unknown,
  propName: string,
  getter: () => T
) {
  Object.defineProperty(onObj, propName, {
    get: getter
  });
}
