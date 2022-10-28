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
 * 
 * Note: for message signing types, see: https://docs.metamask.io/guide/signing-data.html#signing-data-with-metamask
 */

type Var = '*' | '$operator' | string;

export type TrxPermission = {
  contract: Var; // Trx to address, $operator=operator, *=any
  abi: '*' | string; // Trx ABI signature
  params?: '*' | Var[]; // Allowed params, *=any. If array, $operator=operator, *=any. N.B. Ignored if abi='*'
};

export type SignPermission =
  {
    type: 'personal',
    pattern?: '*' | string
  } |
  {
    type: 'eip712',
    contract?: '*' | '$operator' | string
  };

export type Permissions = {
  sudo?: boolean, // Allows everything
  storage?: '*'; // Ext. is allowed to read and write from local storage
  trx?: '*' | TrxPermission[] // Ext. is allowed to call these functions
  sign?: '*' | SignPermission[] // Ext. is allowed to sign these messages
  popups?: boolean // Ext. is allowed to open pop-ups
  modals?: boolean // Ext. is allowed to use alert modals
};

function strEq(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

type CallParams = {
  to: string,
  data: string,
};

type TypeParams = {
  domain: {
    chainId: number,
    name: string,
    verifyingContract: string,
    version: string,
  },
  message: object,
  primaryType: string,
  types: object
};

function isCallParams(params: any[]): params is [ CallParams ] {
  if (params.length !== 1) {
    return false;
  }
  let callParams = params[0];
  return 'to' in callParams && typeof(callParams.to) === 'string' &&
    'data' in callParams && typeof(callParams.data) === 'string';
}

function isTypeParams(params: any[]): params is [ string, TypeParams ] {
  if (params.length !== 2) {
    return false;
  }
  let from = params[0];
  if (typeof(from) !== 'string') {
    return false;
  }
  let typeParams = params[1];
  return 'domain' in typeParams && typeof(typeParams.domain) === 'object' &&
    typeof(typeParams.domain.chainId) === 'number' &&
    typeof(typeParams.domain.name) === 'string' &&
    typeof(typeParams.domain.verifyingContract) === 'string' &&
    typeof(typeParams.domain.version) === 'string' &&
    typeof(typeParams.message) === 'object' &&
    typeof(typeParams.primaryType) === 'string' &&
    typeof(typeParams.types) === 'object';
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

function checkSignPersonal(params: any[], { sign }: Permissions, operator: string | null): null | string {
  if (sign === undefined) {
    return 'Sign personal message not allowed';
  } else if (sign === '*') {
    return null;
  } else {
    let msg = params[0];
    if (typeof msg !== 'string') {
      return 'Invalid sign params';
    }
    let allowed = sign.some((signPerm) => {
      if (signPerm.type === 'personal') {
        if (signPerm.pattern === undefined || signPerm.pattern === '*') {
          return true;
        } else {
          let regex;
          try {
            regex = new RegExp(signPerm.pattern);
          } catch (e) {
            console.error("Error parsing personal sign regex", e);
            return false;
          }
          return regex.test(msg);
        }
      } else {
        return false;
      }
    });
    return allowed ? null : 'Sign personal message not allowed'
  }
}

function checkSignTypedData(params: any[], { sign }: Permissions, operator: string | null): null | string {
  if (sign === undefined) {
    return 'Sign typed data not allowed';
  } else if (sign === '*') {
    return null;
  } else {
    if (!isTypeParams(params)) {
      return 'Invalid sign typed data';
    }
    let [_from, { domain }] = params;
    let allowed = sign.some((signPerm) => {
      if (signPerm.type === 'eip712') {
        if (signPerm.contract === undefined || signPerm.contract === '*') {
          return true;
        } else if (signPerm.contract === '$operator' && operator !== null) {
          return strEq(domain.verifyingContract, operator);
        } else {
          return strEq(domain.verifyingContract, signPerm.contract);
        }
      } else {
        return false;
      }
    });
    return allowed ? null : 'Sign typed data not allowed'
  }
}

export function checkPermission(message: InMessage, permissions: Permissions, operator: string | null): null | string {
  if (permissions.sudo === true) {
    return null;
  }

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
      switch (method.toLowerCase().trim()) {
        case 'eth_sendtransaction':
          return checkSendTransaction(params, permissions, operator);
        case 'eth_sign':
          return 'Eth sign access denied';
        case 'eth_personal':
          return checkSignPersonal(params, permissions, operator);
        case 'eth_signtypeddata':
        case 'eth_signtypeddata_v1':
        case 'eth_signtypeddata_v2':
        case 'eth_signtypeddata_v3':
        case 'eth_signtypeddata_v5':
          return 'Sign typed data (not-v4) access denied';
        case 'eth_signtypeddata_v4':
          return checkSignTypedData(params, permissions, operator);
        default:
          return null;
      }
      return null;
    default:
      throw new Error(`Unknown message: ${JSON.stringify(message)}`);
  }
}
