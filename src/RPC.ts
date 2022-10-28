import { ExtMessage, ExtMessageHandler, InMessage, OutMessage } from './MessageTypes';
import { TransactionResponse } from '@ethersproject/providers';

export interface RPC {
  on: (handler: ExtMessageHandler) => void;
  sendRPC: SendRPC;
  attachHandler: () => void,
  detachHandler: () => void,
}

export type SendRPC = (inMsg: InMessage) => Promise<OutMessage<InMessage>>;

type Handler = Record<number, {resolve: (res: any) => void, reject: (err: any) => void}>;

export async function storageRead(sendRPC: SendRPC, key: string): Promise<string> {
  let { data } = await sendRPC({ type: 'storage:read', key }) as OutMessage<{ type: 'storage:read' }>;
  return data;
}

export async function storageWrite(sendRPC: SendRPC, key: string, value: string) {
  await sendRPC({ type: 'storage:write',  key, value }) as OutMessage<{ type: 'storage:write' }>;
}

export async function sendWeb3(sendRPC: SendRPC, method: string, params: string[]): Promise<any> {
  let { data } = await sendRPC({ type: 'sendWeb3', method, params }) as OutMessage<{ type: 'sendWeb3' }>;
  return data;
}

export function buildRPC(): RPC {
  let msgId = 1;
  let handlers: Handler = {};
  let extHandlers: ExtMessageHandler[] = [];
  let extBacklog: ExtMessage[] = [];

  function handleExtMessage(extMsg: ExtMessage) {
    for (let handler of extHandlers) {
      if (extMsg.type in handler) {
        if (extMsg.type === 'setTheme') {
          handler[extMsg.type]!(extMsg);
        } else if (extMsg.type === 'setCometState') {
          handler[extMsg.type]!(extMsg);
        }
      }
    }
  }

  function sendRPC(inMsg: InMessage): Promise<OutMessage<InMessage>> {
    msgId++;
    let resolve: (res: any) => void;
    let reject: (err: any) => void;
    let p = new Promise<OutMessage<InMessage>>((resolve_, reject_) => {
      resolve = resolve_;
      reject = reject_;
    });
    handlers[msgId] = { resolve: resolve!, reject: reject! };
    if (window.top && window.self !== window.top) {
      window.top.postMessage( { msgId: msgId, message: inMsg }, "*");
    }
    return p as unknown as any;
  }

  const handler = (event: MessageEvent) => {
    if ('type' in event.data) {
      let extMsg = event.data as ExtMessage;
      if (extHandlers.length === 0) {
        extBacklog.push(extMsg);
      } else {
        handleExtMessage(extMsg);
      }
    } else {
      let msgId: number | undefined = event.data.msgId;
      let result: any | undefined = event.data.result;
      let error: any | undefined = event.data.error;
      if (msgId !== undefined && msgId in handlers) {
        let { resolve, reject } = handlers[msgId]!;
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        }
      }
    }
  }

  function attachHandler() {
    window.addEventListener("message", handler);
  }

  function detachHandler() {
    window.removeEventListener("message", handler)
  }

  function on(handler: ExtMessageHandler) {
    extHandlers.push(handler);
    extBacklog.forEach(handleExtMessage);
  }

  return {
    on,
    sendRPC,
    attachHandler,
    detachHandler
  };
}
