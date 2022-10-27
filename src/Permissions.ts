import { InMessage } from './MessageTypes';
import { Interface } from '@ethersproject/abi';

/**
 * Extensions - Permissions
 *
 * Permissions define what an extension is allowed to do
 * via message passing to the app. For instance, if it
 * is allowed to send transactions to the provider (e.g.
 * MetaMask) on behalf of the user. We can allow more complex
 * permissions, such as push notifications or access tokens,
 * and permission can be fine-grained, such as restricting
 * reads or writes to only certain contracts addresses, or
 * on certain networks or deployments.
 */

type Var = '*' | '$operator' | string;

export type TrxPermission = {
  contract: Var; // Trx to address, $operator=operator, *=any
  abi: '*' | string; // Trx ABI signature
  params?: '*' | Var[]; // Allowed params, *=any. If array, $operator=operator, *=any. N.B. Ignored if abi='*'
};

export type Permissions = {
  storage?: '*'; // Ext. is allowed to read and write from local storage
  trx?: '*' | TrxPermission[] // Ext. is allowed to call these functions
};

function strEq(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

type CallParams = {
  to: string,
  data: string,
};

function isCallParams(params: any[]): params is [ CallParams ] {
  if (params.length !== 1) {
    return false;
  }
  let callParams = params[0];
  return 'to' in callParams && typeof(callParams.to) === 'string' &&
    'data' in callParams && typeof(callParams.data) === 'string';
}

function checkSendTransaction(params: any[], { trx }: Permissions, operator: string | null): null | string {
  if (trx === '*') {
    return null;
  } else {
    if (!isCallParams(params)) {
      return 'Invalid send transaction params';
    }
    let [ callParams ] = params;
    let allowed = (trx ?? []).some((trxPerm) => {
      if (trxPerm.contract !== '*') {
        let contract = trxPerm.contract;
        if (contract === '$operator') {
          if (!operator) {
            return false;
          }

          contract = operator;
        }

        if (!strEq(contract, callParams.to)) {
          return false;
        }
      }

      if (trxPerm.abi === '*') {
        return true;
      } else {
        let { abi } = trxPerm;
        let iface;
        try {
          iface = new Interface([`function ${abi.toString()}`]);
        } catch (e: unknown) {
          console.error("Error parsing interface", e);
          return false;
        }
        let func = Object.values(iface.functions)[0];
        if (!strEq(callParams.data.slice(0, 10), iface.getSighash(func.name))) {
          return false;
        }
        let funcParamsEnc = callParams.data.slice(10);
        if (trxPerm.params === undefined || trxPerm.params === '*') {
          return true;
        } else {
          let decodedParams = iface.decodeFunctionData(func, callParams.data);
          let matchesParams = trxPerm.params.every((param, index) => {
            let decodedParam = decodedParams[index];
            if (decodedParam === undefined) {
              return false;
            }
            if (param === '*') {
              return true;
            } else if (param === '$operator') {
              if (!operator) {
                return false;
              } else {
                return strEq(operator, decodedParam.toString())
              }
            } else {
              return strEq(param, decodedParam.toString());
            }
          });
          return matchesParams;
        }
      }
    });

    return allowed ? null : 'Web3 transaction not allowed';
  }
  return null;
}

export function checkPermission(message: InMessage, permissions: Permissions, operator: string | null): null | string {
  switch (message.type) {
    case 'storage:read':
      if (permissions.storage && permissions.storage) {
        return null;
      } else {
        return 'Read access denied';
      }
    case 'storage:write':
      if (permissions.storage && permissions.storage) {
        return null;
      } else {
        return 'Write access denied';
      }
    case 'sendWeb3':
      let { method, params } = message;
      switch (method.toLowerCase()) {
        case 'eth_sendtransaction':
          return checkSendTransaction(params, permissions, operator);
        default:
          return null;
      }
      return null;
    default:
      throw new Error(`Unknown message: ${JSON.stringify(message)}`);
  }
}
