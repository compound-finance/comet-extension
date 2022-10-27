import { storageRead, storageWrite, SendRPC } from './RPC';

export class LocalStorage {
  sendRPC?: SendRPC;

  constructor(sendRPC?: SendRPC) {
    this.sendRPC = sendRPC;
  }

  private localStorage(): Storage {
    if ('localStorage' in window) {
      return window.localStorage;
    } else {
      throw new Error(`LocalStorage: RPC not provided and localStorage missing`);
    }
  }

  async setItem(key: string, value: string) {
    if (this.sendRPC) {
      await storageWrite(this.sendRPC, key, value);
    } else {
      return this.localStorage().setItem(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.sendRPC) {
      return await storageRead(this.sendRPC, key);
    } else {
      return this.localStorage().getItem(key);
    }
  }
}
