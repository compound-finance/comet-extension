import test from 'ava';
import { parseEther } from '@ethersproject/units';
import { Interface } from '@ethersproject/abi';
import { InMessage } from '../src/MessageTypes';
import { Permissions, checkPermission } from '../src/Permissions';

interface Test {
  name: string;
  permissions: Permissions;
  message: InMessage,
  exp: null | string;
}

const iface = new Interface([
  "function approve(address spender, uint amount)",
]);

const ABI = "approve(address,uint256)";
const TOKEN = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const OPERATOR = '0x1dD398C2c7fAee61eBB522c434e9f83cf3A9196b';
const ONE_ETHER = parseEther("1.0").toString();
const approveTrx = [
  {
    to: TOKEN,
    data: iface.encodeFunctionData("approve", [
      OPERATOR,
      ONE_ETHER
    ])
  }
];

let tests: Test[] = [
  {
    name: 'storage:read - empty',
    permissions: {},
    message: { type: 'storage:read', key: 'dog' },
    exp: 'Read access denied'
  },
  {
    name: 'storage:read - allowed',
    permissions: { 'storage': '*' },
    message: { type: 'storage:read', key: 'dog' },
    exp: null
  },
  {
    name: 'storage:write - empty',
    permissions: {},
    message: { type: 'storage:write', key: 'dog', value: 'keen' },
    exp: 'Write access denied'
  },
  {
    name: 'storage:write - allowed',
    permissions: { 'storage': '*' },
    message: { type: 'storage:write', key: 'dog', value: 'keen' },
    exp: null
  },
  {
    name: 'trx - chainId - empty',
    permissions: {},
    message: { type: 'sendWeb3', method: 'eth_chainId', params: [] },
    exp: null
  },
  {
    name: 'trx - sendTransaction - empty',
    permissions: {},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: 'Web3 transaction not allowed'
  },
  {
    name: 'trx - sendTransaction - not allowed',
    permissions: { trx: [] },
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: 'Web3 transaction not allowed'
  },
  {
    name: 'trx - sendTransaction - allow all',
    permissions: { trx: '*' },
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: null
  },
  {
    name: 'trx - sendTransaction - allow exact',
    permissions: { trx: [
      {
        contract: TOKEN,
        abi: ABI,
        params: [ OPERATOR, ONE_ETHER ]
      }
    ]},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: null
  },
  {
    name: 'trx - sendTransaction - allow params partial *',
    permissions: { trx: [
      {
        contract: TOKEN,
        abi: ABI,
        params: [ OPERATOR, '*' ]
      }
    ]},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: null
  },
  {
    name: 'trx - sendTransaction - allow $operator',
    permissions: { trx: [
      {
        contract: TOKEN,
        abi: ABI,
        params: [ '$operator', ONE_ETHER ]
      }
    ]},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: null
  },
  {
    name: 'trx - sendTransaction - fail params mismatch',
    permissions: { trx: [
      {
        contract: TOKEN,
        abi: ABI,
        params: [ OPERATOR, '5' ]
      }
    ]},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: 'Web3 transaction not allowed'
  },
  {
    name: 'trx - sendTransaction - allow params full *',
    permissions: { trx: [
      {
        contract: TOKEN,
        abi: ABI,
        params: '*'
      }
    ]},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: null
  },
  {
    name: 'trx - sendTransaction - fail abi mismatch',
    permissions: { trx: [
      {
        contract: TOKEN,
        abi: 'abi()',
        params: [ OPERATOR, ONE_ETHER ]
      }
    ]},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: 'Web3 transaction not allowed'
  },
  {
    name: 'trx - sendTransaction - allow abi * [note: params ignored]',
    permissions: { trx: [
      {
        contract: TOKEN,
        abi: '*',
        params: [ '1', '2', '3' ]
      }
    ]},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: null
  },
  {
    name: 'trx - sendTransaction - fail mismatch token',
    permissions: { trx: [
      {
        contract: OPERATOR,
        abi: ABI,
        params: [ OPERATOR, ONE_ETHER ]
      }
    ]},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: 'Web3 transaction not allowed'
  },
  {
    name: 'trx - sendTransaction - allow operator *',
    permissions: { trx: [
      {
        contract: '*',
        abi: ABI,
        params: [ OPERATOR, ONE_ETHER ]
      }
    ]},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: null
  },
  {
    name: 'trx - sendTransaction - fail invalid ABI',
    permissions: { trx: [
      {
        contract: '*',
        abi: "!!!!",
        params: '*'
      }
    ]},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: approveTrx },
    exp: 'Web3 transaction not allowed'
  },
];

tests.forEach(({ name, permissions, message, exp }) => {
  test(`Permissions: ${name}`, async (t) => {
    t.is(checkPermission(message, permissions, OPERATOR), exp);
  });
});
