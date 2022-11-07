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
      ipfs: 'QmNxpWQNGvEmfR411JKQCd3Jmdu2ZkMRVciGFU5B3fMmSg',
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
  }
];
