export type { InMessage, OutMessage, ExtMessage, ExtMessageHandler } from './MessageTypes';

export type { RPC, SendRPC } from './RPC';
export { buildRPC, read, write, sendWeb3 } from './RPC';

export { RPCWeb3Provider } from './RPCWeb3Provider';

export type { Extension } from './Extension';
export { extensions } from './Extension';

export type { Permissions } from './Permissions';
export { checkPermission } from './Permissions';

export type { CometState } from './CometState';
