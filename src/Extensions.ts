import { Extension } from './Extension.js';

export const extensions: Extension[] = [
  {
    id: 'bulker',
    name: 'Advanced Transactions',
    description: 'Combine multiple protocol actions into a single transaction to save on gas costs, through the Compound III proxy contract.',
    sub_description: 'This extension enables new functionality in the main protocol dashboard, and does not have its own custom interface.',
    developer: 'Compound Labs',
    links: {
      github: 'https://github.com/compound-finance/comet',
      website: 'https://twitter.com/compoundfinance'
    },
    permissions: {
      storage: '*',
      trx: [
        {
          contract: '*',
          abi: 'approve(address,uint256)',
          params: ['$operator', '*']
        }
      ]
    },
    source: {
      url: null,
    },
    supportedMarkets: {
      '1_USDC_0xc3d688B66703497DAA19211EEdff47f25384cdc3': '0x74a81F84268744a40FEBc48f8b812a1f188D80C3'
    }
  },
  {
    id: 'comet_migrator',
    name: 'Compound V3 Position Migrator',
    description: 'Migrate stablecoin borrow balances and supported collateral assets from Compound V2 or Aave V2 to the Compound V3 USDC market on the Ethereum network.',
    developer: 'Compound Labs',
    links: {
      github: 'https://github.com/compound-finance/comet-migrator',
      website: 'https://twitter.com/compoundfinance'
    },
    permissions: {
      storage: '*',
      trx: [
        {
          contract: '$operator',
          abi: 'migrate(((address,uint256)[],(address,uint256)[],(bytes,uint256)[]),((address,uint256)[],(address,uint256)[],(bytes,uint256)[]),uint256)',
          params: '*',
        },
        {
          contract: '*',
          abi: 'approve(address,uint256)',
          params: ['$operator', '*'],
        },
      ],
    },
    source: {
      ipfs: 'QmbLCnpr74GPexVV1f1Ws5R6JtitztteHgSLbXnB8n7Xkv',
      domain: 'comet-v2-migrator.infura-ipfs.io',
      path: '/embedded.html',
    },
    supportedMarkets: {
      '1_USDC_0xc3d688B66703497DAA19211EEdff47f25384cdc3': '0x3b6f1FE07CDAB8A43f39C3b99Ba8FF26e28DB8b4',
    },
  },
  {
    id: 'comp_vote',
    name: 'Comp.Vote',
    description: 'Participate in Compound Governance via signature to save on gas fees, without having to send your transaction on-chain. ',
    developer: 'arr00 and anish',
    links: {
      github: 'https://github.com/Comp-Vote/comp.vote',
      website: 'https://comp.vote/'
    },
    permissions: {
      sign: '*',
      popups: true,
      modals: true
    },
    source: {
      url: "https://comp.vote/?embedded"
    },
    supportedMarkets: 'all',
  },
  {
    id: 'defisaver',
    name: 'DeFi Saver',
    description: 'Easily rebalance your Compound position in a single transaction and set up automated liquidation protection.',
    developer: 'DeFi Saver',
    links: {
      github: 'https://github.com/defisaver/defisaver-v3-contracts',
      website: 'https://defisaver.com/',
    },
    permissions: {
      sudo: true,
    },
    source: {
      url: 'https://app.defisaver.com/',
    },
    supportedMarkets: {
      '1_USDC_0xc3d688B66703497DAA19211EEdff47f25384cdc3': null,
    },
  },
];
