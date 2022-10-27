import { sendWeb3, SendRPC } from './RPC';
import { JsonRpcProvider } from '@ethersproject/providers';

export class RPCWeb3Provider extends JsonRpcProvider  {
  sendRPC: SendRPC;

  constructor(sendRPC: SendRPC) {
    super(undefined, "any");
    this.sendRPC = sendRPC;
  }

  send(method: string, params: Array<any>): Promise<any> {
    const cache = ["eth_chainId", "eth_blockNumber"].indexOf(method) >= 0;
    if (cache && method in this._cache) {
      return this._cache[method];
    }
    let res = sendWeb3(this.sendRPC, method, params);
    if (cache) {
      this._cache[method] = res;
      setTimeout(() => {
        delete this._cache[method];
      }, 0);
    }
    return res;
  }
}
