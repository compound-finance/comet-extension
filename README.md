
# Comet Extension

For extensions to [Compound III](https://v3-app.compound.finance), this repo contains the base code for implementing an extension, as well as a curated list of extensions.

## About Extensions

Compound III Extensions, as the name suggest, extend the functionality of Compound III. These come in two non-exclusive varities:

 1. Web Extensions which extend the [Compound III Interface](https://v3-app.compound.finance)
 2. Operators which extend the [Compound III Protocol](https://github.com/compound-finance/comet).

Many extensions have both a Web Extension and an Operator. Often, the Web Extension acts as the user interface for the Operator. It's possible, however, to have an extension that does not have an on-chain element, such as an alerting or reporting system. It's also possible to have an Operator that does not have a Web Extension, such as the Compound III Bulker tool, whose interface is wrapped directly into the Compound III interface itself.

### Web Extensions

Web Extensions are mini-websites which embed into the Compound III interface in a sandboxed iframe. These web extensions can be opened by a user of the interface and present their own user experience to the user. Permissions grant abilities to interact with the outer Compound III interface, such as to queue up a new transaction or, in the future, send a push notification.

Web Extensions communicate with the outer Compound III interface through standard window messages (i.e. `window.top.postMessage()`). Most of this is abstracted away in the usage of the `RPC` framework in this library. E.g.

```ts
let rpc: RPC = buildRPC();

// Send transaction request
let chainId = await sendWeb3(rpc, 'eth_chainId', []);

// Handle incoming messages
rpc.on({setTheme: ({theme}) => {
  console.log('theme', theme);
});
```

Note: it's recommended to use `RPCWeb3Provider` which provides a shim to a standard Web3 provider (similar to [JsonRpcProvider](https://docs.ethers.io/v5/api/providers/jsonrpc-provider/)), e.g.

```ts
let rpc: RPC = buildRPC();
let provider = new RPCWeb3Provider(rpc);

provider.sendTransaction(...);
```

### Operators

Operators are smart contracts that have access to act on behalf of a user's Compound III position. For instance, the [Comet Migrator](https://github.com/compound-finance/comet-migrator) is a smart contract which moves a position from Compound II or other DeFi platforms, using a flash loan to move the position atomically. Extensions may often be one-to-one with an operator (defined by a chain and network address), and the Web Extension may just be the user interface to the operator. Read more about Compound III operators in the [Compound III documentation](https://github.com/compound-finance/comet).

## Creating an Extension

The easiest way to create an extension is to fork the [comet-extension-template](https://github.com/compound-finance/comet-extension-template) project. The template has a full set-up to build a Compound III Operator via forge and a web experience via React on Vite. The web app can be run as a standalone application or as an embedded Web Extension. Additionally, there's tools to deploy the Web Extension to IPFS, which is the recommended way to host a Compound III Web Extension. Please see [comet-extension-template](https://github.com/compound-finance/comet-extension-template) for more details on forking the template and deploying an Extension. Note: once you have an extension deployed, you will create a pull request against _this repo_ to add it to the curated list of extensions (see below).

## Adding an Extension

Once you've created an extension, you may create a pull request to this repo to add it to the curated list of extensions.

:warning: This repo contains a list of Extensions curated by Compound. See [Curation and Safety](#) below for more information. Extensions may also be used in stand-alone mode (see the [Creating an Extension](#Creating-an-Extension)) or may be integrated into a public fork of the Compound III interface.

To add an extension, create a pull request to this repo, adding the configuration for your extension to `extensions.js`. For example:

```diff
 [
   ...,
+  {
+    "id": "comet_migrator",
+    "name": "Compound III Migrator",
+    "permissions": {
+      "read": "*",
+      "write": "*"
+    },
+    "source": {
+      "ipfs": "QmRe6VBCXE9Wwb5fKkynYxtqbZ6Af1i72mhRzyN95vhxMy",
+      "domain": "comet-v2-migrator.infura-ipfs.io",
+      "path": "/embedded.html"
+    }
+  }
]
```

See [src/Extension.ts](./blob/main/src/Extension.ts) for more details on format of the extension configuration.

## Curation and Safety

Compound and its community take safety at the highest level of importance. As such, this repository only contains extensions that have matched a high bar for safety and correctness. We expect the community to help build a set of guidelines for accepting a new extension, but at the least, the following are important factors that will be considered on whether or not to merge a Pull Request for an Extension. Please note: extensions can be deployed on a fork of the interface or as a standalone interface regardless of inclusion in the main branch of this repo.

 1. If there is an Operator for the Extension, has the Operator been audited?
 2. If there is an Operator for the Extension, does the Operator have a limited surface area for exploitation?
 3. If there is a Web Extension, does the Web Extension ask for a narrowly-tailored set of permissions?
 3. If there is a Web Extension, does it respect the user's expectations and protect their privacy?
 4. Does the Extension bring overall value to the community and users of the protocol?
 5. Does the Extension meet the high qualities and standards expected by the Compound community?

The bar for inclusion is thus very high, and it may be worth garnering feedback on the [community forums](https://comp.xyz). We anticipate over time there will be a formal process to get community support for Extensions.

Again, inclusion in the main branch of this repo is just to be available Compound's own [Compound III Interface](https://v3-app.compound.finance). You should be able to deploy your Extension as a standalone experience or deploy a fork of the Compound III interface including your Extension.

## Building & Publishing

To build locally, simply run:

```
tsc
```

The output will be in the `dist` folder.

To deploy a new version, bump the version in `package.json` and create a pull request merged into main branch. The next version will be automatically deployed.

## Contributing

Feel free to create pull requests to expand the scope of the Compound Extension ecosystem. We're interested in expanding what extensions can do while maintaining user safety and privacy. You can also create issues here to discuss or chat in the [forums](https://comp.xyz) or [discord](https://compound.finance/discord). All contributors agree that any contributions are hereby licensed as below.

## License

All rights reserved, 2022 Compound Labs, Inc.
