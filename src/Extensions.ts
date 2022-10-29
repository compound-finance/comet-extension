import { Extension } from './Extension.js';

export const extensions: Extension[] = [
  {
    id: 'comet_migrator',
    name: 'Compound III Migrator',
    permissions: {
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
      ipfs: 'QmRe6VBCXE9Wwb5fKkynYxtqbZ6Af1i72mhRzyN95vhxMy',
      domain: 'comet-v2-migrator.infura-ipfs.io',
      path: '/embedded.html'
    }
  },
  {
    id: 'comp_vote',
    name: 'Comp.vote',
    permissions: {
      sign: '*'
    },
    source: {
      url: 'https://comp-vote-xi.vercel.app/'
    }
  }
];
