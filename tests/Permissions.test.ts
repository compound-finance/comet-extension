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
const FROM = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
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

const typedDataV4 = {
  domain: {
    // Defining the chain aka Rinkeby testnet or Ethereum Main Net
    chainId: 1,
    // Give a user friendly name to the specific contract you are signing for.
    name: "Ether Mail",
    // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
    verifyingContract: OPERATOR,
    // Just let's you know the latest version. Definitely make sure the field name is correct.
    version: "1"
  },

  // Defining the message signing data content.
  message: {
    /*
     - Anything you want. Just a JSON Blob that encodes the data you want to send
     - No required fields
     - This is DApp Specific
     - Be as explicit as possible when building out the message schema.
    */
    contents: "Hello, Bob!",
    attachedMoneyInEth: 4.2,
    from: {
      name: "Cow",
      wallets: [
        "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF"
      ]
    },
    to: [
      {
        name: "Bob",
        wallets: [
          "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
          "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
          "0xB0B0b0b0b0b0B000000000000000000000000000"
        ]
      }
    ]
  },
  // Refers to the keys of the *types* object below.
  primaryType: "Mail",
  types: {
    // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ],
    // Not an EIP712Domain definition
    Group: [
      { name: "name", type: "string" },
      { name: "members", type: "Person[]" }
    ],
    // Refer to PrimaryType
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person[]" },
      { name: "contents", type: "string" }
    ],
    // Not an EIP712Domain definition
    Person: [
      { name: "name", type: "string" },
      { name: "wallets", type: "address[]" }
    ]
  }
};

const typedParams = [FROM, typedDataV4];

let tests: Test[] = [
  /** SUDO **/
  {
    name: 'sudo',
    permissions: { sudo: true },
    message: { type: 'storage:read', key: 'dog' },
    exp: null
  },
  /** STORAGE **/
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
  /** getSelectedMarket **/
  {
    name: 'getSelectedMarket - allowed',
    permissions: {},
    message: { type: 'getSelectedMarket' },
    exp: null
  },
  /** TRX **/
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
    name: 'trx - sendTransaction - invalid',
    permissions: {},
    message: { type: 'sendWeb3', method: 'eth_sendTransaction', params: [] },
    exp: 'Invalid send transaction params'
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
  /** SIGN MESSAGE [ETH_SIGN] **/
  {
    name: 'sign - eth_sign - fail alt',
    permissions: {},
    message: { type: 'sendWeb3', method: 'eth_sign', params: ['hi'] },
    exp: 'Eth sign access denied'
  },
  /** SIGN MESSAGE [PERSONAL] **/
  {
    name: 'sign - eth_personal - fail empty',
    permissions: {},
    message: { type: 'sendWeb3', method: 'eth_personal', params: ['hi'] },
    exp: 'Sign personal message not allowed'
  },
  {
    name: 'sign - eth_personal - fail invalid',
    permissions: {
      sign: [ { type: 'personal' } ]
    },
    message: { type: 'sendWeb3', method: 'eth_personal', params: [5] },
    exp: 'Invalid sign params'
  },
  {
    name: 'sign - eth_personal - allow blank',
    permissions: {
      sign: [ { type: 'personal' } ]
    },
    message: { type: 'sendWeb3', method: 'eth_personal', params: ['hi'] },
    exp: null
  },
  {
    name: 'sign - eth_personal - allow *',
    permissions: {
      sign: [ { type: 'personal', pattern: '*' } ]
    },
    message: { type: 'sendWeb3', method: 'eth_personal', params: ['hi'] },
    exp: null
  },
  {
    name: 'sign - eth_personal - allow pattern match',
    permissions: {
      sign: [ { type: 'personal', pattern: '[a-zA-Z]{3,5}' } ]
    },
    message: { type: 'sendWeb3', method: 'eth_personal', params: ['hii'] },
    exp: null
  },
  {
    name: 'sign - eth_personal - fail pattern match',
    permissions: {
      sign: [ { type: 'personal', pattern: '[a-zA-Z]{3,5}' } ]
    },
    message: { type: 'sendWeb3', method: 'eth_personal', params: ['h'] },
    exp: 'Sign personal message not allowed'
  },
  {
    name: 'sign - eth_personal - invalid pattern',
    permissions: {
      sign: [ { type: 'personal', pattern: '[a-z' } ]
    },
    message: { type: 'sendWeb3', method: 'eth_personal', params: ['h'] },
    exp: 'Sign personal message not allowed'
  },
  /** SIGN MESSAGE [EIP-712] **/
  {
    name: 'sign - eth_signTypedData_v4 - fail empty',
    permissions: {},
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v4', params: typedParams },
    exp: 'Sign typed data not allowed'
  },
  {
    name: 'sign - eth_signTypedData_v4 - allowed sign *',
    permissions: {
      sign: '*'
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v4', params: typedParams },
    exp: null
  },
  {
    name: 'sign - eth_signTypedData_v4 - fail empty sign perms',
    permissions: {
      sign: []
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v4', params: typedParams },
    exp: 'Sign typed data not allowed'
  },
  {
    name: 'sign - eth_signTypedData_v4 - fail invalid data',
    permissions: {
      sign: []
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v4', params: [FROM, {}] },
    exp: 'Invalid sign typed data'
  },
  {
    name: 'sign - eth_signTypedData_v4 - fail mismatched contract address',
    permissions: {
      sign: [ { type: 'eip712', contract: '0xcccccccccccccccccccccccccccccccccccccccc' }]
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v4', params: typedParams },
    exp: 'Sign typed data not allowed'
  },
  {
    name: 'sign - eth_signTypedData_v4 - allow empty contract',
    permissions: {
      sign: [ { type: 'eip712' }]
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v4', params: typedParams },
    exp: null
  },
  {
    name: 'sign - eth_signTypedData_v4 - allow * contract',
    permissions: {
      sign: [ { type: 'eip712', contract: '*' }]
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v4', params: typedParams },
    exp: null
  },
  {
    name: 'sign - eth_signTypedData_v4 - allow matching contract',
    permissions: {
      sign: [ { type: 'eip712', contract: '0x1dd398c2c7faee61ebb522c434e9f83cf3a9196b' }]
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v4', params: typedParams },
    exp: null
  },
  {
    name: 'sign - eth_signTypedData_v4 - allow operator contract',
    permissions: {
      sign: [ { type: 'eip712', contract: '$operator' }]
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v4', params: typedParams },
    exp: null
  },
  /** SIGN MESSAGE [EIP-712] [ALTS] **/
  {
    name: 'sign - eth_signTypedData - fail alt',
    permissions: {
      sign: [ { type: 'eip712', contract: '$operator' }]
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData', params: typedParams },
    exp: 'Sign typed data (not-v4) access denied'
  },
  {
    name: 'sign - eth_signTypedData_v1 - fail alt',
    permissions: {
      sign: [ { type: 'eip712', contract: '$operator' }]
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v1', params: typedParams },
    exp: 'Sign typed data (not-v4) access denied'
  },
  {
    name: 'sign - eth_signTypedData_v2 - fail alt',
    permissions: {
      sign: [ { type: 'eip712', contract: '$operator' }]
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v2', params: typedParams },
    exp: 'Sign typed data (not-v4) access denied'
  },
  {
    name: 'sign - eth_signTypedData_v3 - fail alt',
    permissions: {
      sign: [ { type: 'eip712', contract: '$operator' }]
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v3', params: typedParams },
    exp: 'Sign typed data (not-v4) access denied'
  },
  {
    name: 'sign - eth_signTypedData_v5 - fail alt',
    permissions: {
      sign: [ { type: 'eip712', contract: '$operator' }]
    },
    message: { type: 'sendWeb3', method: 'eth_signTypedData_v5', params: typedParams },
    exp: 'Sign typed data (not-v4) access denied'
  },
];

tests.forEach(({ name, permissions, message, exp }) => {
  test(`Permissions: ${name}`, async (t) => {
    t.is(checkPermission(message, permissions, OPERATOR), exp);
  });
});
