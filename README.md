# Status Op

Utility wrapper for promises with progress and events.

### Getting Started

```sh
npm install statusop
```

### Examples

```typescript
import { wrapPromise } from "statusop";
import { ExternallyManagedStatusOp } from "statusop";
import { StandardStatusOp } from "statusop";
export { DelayedInitStatusOp } from "statusop";

// to 'wrap' a promise
const wrappedOp = wrapPromise(myPromise);

// to have more control over the process
const myOp = new ExternallyManagedStatusOp<TPayloadType>();

myOp.notifyProgress(0.1);
myOp.notifyProgress(0.5);
myOp.notifyProgress(1);
myOp.notifyResponseReceived(myPayload);

// custom op implementations
export type UserInfo = {
  name: string;
  age: number;
};

export class SyncUserInfoAutoStartOp extends StandardStatusOp<ExampleTaskPayload> {
  private _userID: string;
  constructor(userID: string) {
    super();
    this._userID = userID;
  }

  protected async _runLogic() {
    // ...do something
    let result: UserInfo = await fetchUser(this._userID);
    return result;
  }
}

export class SyncUserInfoManualStartOp extends DelayedInitStatusOp<UserInfo> {
  private _userID: string;
  constructor(userID: string) {
    super();
    this._userID = userID;
  }

  start() {
    this._setLogic(this._sync());
  }

  private async _sync() {
    // ...do something
    let result: UserInfo = await fetchUser(this._userID);
    return result;
  }
}

const autoStartOp = new SyncUserInfoAutoStartOp("userABC");

let userInfoABC = await autoStartOp;

const manualStartOp = new SyncUserInfoManualStartOp("userXYZ");
manualStartOp.start();

let userInfoXYZ = await autoStartOp;
```
