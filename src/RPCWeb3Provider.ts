import { sendWeb3, SendRPC } from './RPC';
import { JsonRpcProvider } from '@ethersproject/providers';

interface JsonRpcRequest {
  id: string | undefined;
  jsonrpc: '2.0';
  method: string;
  params?: Array<any>;
}

interface JsonRpcResponse {
  id: string | undefined;
  jsonrpc: '2.0';
  method: string;
  result?: unknown;
  error?: Error;
}

type JsonRpcCallback = (error: Error | undefined, response: JsonRpcResponse) => unknown;

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

  async sendAsync(payload: JsonRpcRequest, callback: JsonRpcCallback): Promise<void> {
    const {id, method, params} = payload;
    let res;
    try {
      let result = await this.send(method, params || []);
      callback(undefined, {
        id,
        jsonrpc: '2.0',
        method,
        result,
      });
    } catch (error: unknown) {
      callback(error as Error, {
        id,
        jsonrpc: '2.0',
        method,
        error: error as Error
      });
    }
  }
}
