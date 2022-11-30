import { RunState } from '../interpreter';
import { Common } from '@ethereumjs/common';
export interface SyncOpHandler {
    (runState: RunState, common: Common): void;
}
export interface AsyncOpHandler {
    (runState: RunState, common: Common): void;
}
export declare type OpHandler = SyncOpHandler | AsyncOpHandler;
export declare const handlers: Map<number, OpHandler>;
//# sourceMappingURL=functions.d.ts.map