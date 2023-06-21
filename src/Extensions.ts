import { Extension } from './Extension.js';

export const extensions: Extension[] = [
  {
    id: 'comet_migrator',
    name: 'Compound V3 Position Migrator',
    description: 'Migrate USDC balances and supported collateral assets from Compound V2 to the Compound V3 USDC market on the Ethereum network.',
    developer: 'Compound Labs',
    links: {
      github: 'https://github.com/compound-finance/comet-migrator',
      website: 'https://compound.finance/'
    },
    permissions: {
      storage: '*',
      trx: [
        {
          contract: '$operator',
          abi: 'migrate((address,uint256)[],uint256)',
          params: '*'
        },
        {
          contract: '*',
          abi: 'approve(address,uint256)',
          params: ['$operator', '*']
        }
      ]
    },
    source: {
      ipfs: 'QmeDbWFcgZkDvuMFoQQezyAd69LwvPv5mgwVBDw7bfTrsB',
      domain: 'comet-v2-migrator.infura-ipfs.io',
      path: '/embedded.html'
    },
    supportedMarkets: {
      '1_USDC_0xc3d688B66703497DAA19211EEdff47f25384cdc3': '0x1dD398C2c7fAee61eBB522c434e9f83cf3A9196b',
      '5_USDC_0x3EE77595A8459e93C2888b13aDB354017B198188': '0x6d1f37f5c2c6cf70871a93e439bf921c195c427f'
    }
  },
  {
    id: 'comp_vote',
    name: 'Comp.Vote',
    description: 'Voting by signature lets you place votes across Compound Governance proposals, without having to send your transactions on-chain, saving fees.',
    developer: 'Community-led by arr00 and anish',
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
      url: "https://comp-vote-xi.vercel.app/?embedded"
    },
    supportedMarkets: {
      '1_USDC_0xc3d688B66703497DAA19211EEdff47f25384cdc3': null
    }
  },
  {
    id: 'collateral_swap',
    name: 'Collateral Swap',
    description: 'Enables swapping collateral on open loan positions without the need to repay the loan, in a single transaction',
    developer: 'Wido Labs',
    links: {
      github: 'https://github.com/widolabs/compound-collateral-extension-ui',
      website: 'https://www.joinwido.com/'
    },
    permissions: {
      sign: '*',
    },
    source: {
      url: "https://wido-extension-template.vercel.app/embedded.html"
    },
    supportedMarkets: {
      '1_USDC_0xc3d688B66703497DAA19211EEdff47f25384cdc3': null,
      '1_WETH_0xA17581A9E3356d9A858b789D68B4d866e593aE94': null,
      '137_USDC_0xF25212E676D1F7F89Cd72fFEe66158f541246445': null,
      '42161_USDC_0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA': null
    }
  }
];
