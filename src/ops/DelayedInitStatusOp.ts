import type { IStatusOpEventMap } from "@/src/types";

import { genPromiseObj } from "@/src/utils";
import { StatusOp } from "@/src/ops/StatusOp";

export abstract class DelayedInitStatusOp<
  T,
  TEventMap extends IStatusOpEventMap<T> = IStatusOpEventMap<T>
> extends StatusOp<T, TEventMap> {
  constructor() {
    const tmpPromiseObj = genPromiseObj<T>();
    super({
      promise: tmpPromiseObj.promise
    });

    this._setLogic = function (to: Promise<T>) {
      to.then(r => {
        tmpPromiseObj.resolve(r);
      }).catch(() => {});
      to.catch(e => {
        tmpPromiseObj.reject(e);
      });

      // @ts-expect-error we're removing this
      delete this._setLogic;
    };
  }

  get started(): boolean {
    return !this._setLogic;
  }

  // special property that can only be set once
  //   will be deleted after being called
  protected _setLogic!: (to: Promise<T>) => void;
}

export default DelayedInitStatusOp;
