import { TransactionResponse } from '@ethersproject/providers';
import type { CometState } from './CometState';

/**
 * Extensions - Messages
 *
 * Here we define the types of messages that we can receive
 * from an extension, and the corresponding response types
 * that the extension should expect to receive. For every
 * `InMessage` sent to this app, the extension should receive
 * either the corresponding `OutMessage[InMessage]` or an
 * error tuple.
 *
 * Note: it would benefit extensions to copy-paste in this file,
 *       and is one of the few places we would consider factoring
 *       out into a shared lib to make that easy.
 */
export type InMessage =
  | { type: 'storage:read'; key: string; }
  | { type: 'storage:write'; key: string;  value: string }
  | { type: 'sendWeb3'; method: string; params: any[] }
  | { type: 'getTheme'; }
  | { type: 'getCometState'; };

export type OutMessage<InMessage> = InMessage extends { type: 'storage:read' }
  ? { type: 'storage:read'; data: string }
  : InMessage extends { type: 'storage:write' }
  ? { type: 'storage:write'; data: null }
  : InMessage extends { type: 'sendWeb3' }
  ? { type: 'sendWeb3'; data: any }
  : InMessage extends { type: 'getTheme' }
  ? { type: 'setTheme'; theme: 'Dark' | 'Light' }
  : InMessage extends { type: 'getCometState' }
  ? { type: 'setCometState'; cometState: CometState }
  : null;

export type ExtMessage =
  | { type: 'setTheme', theme: 'Dark' | 'Light' }
  | { type: 'setCometState', cometState: CometState };

type ExtMessageConfig<ExtMessage extends { type: string }> = {
    [E in ExtMessage as E["type"]]?: (msg: E) => void;
};

export type ExtMessageHandler = ExtMessageConfig<ExtMessage>;
