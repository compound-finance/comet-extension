export type { InMessage, OutMessage, ExtMessage, ExtMessageHandler } from './MessageTypes.js';

export type { RPC, SendRPC } from './RPC.js';
export { buildRPC, storageRead, storageWrite, sendWeb3 } from './RPC.js';

export { RPCWeb3Provider } from './RPCWeb3Provider.js';

export type { Extension } from './Extension.js';
export { extensions } from './Extensions.js';

export type { Permissions } from './Permissions.js';
export { checkPermission } from './Permissions.js';

export type { CometState } from './CometState.js';
