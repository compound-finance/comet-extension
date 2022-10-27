import { Extension } from './Extension';

export const extensions: Extension[] = [
  {
    id: 'comet_migrator',
    name: 'Compound III Migrator',
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
      ipfs: 'QmRe6VBCXE9Wwb5fKkynYxtqbZ6Af1i72mhRzyN95vhxMy',
      domain: 'comet-v2-migrator.infura-ipfs.io',
      path: '/embedded.html'
    }
  }
];
