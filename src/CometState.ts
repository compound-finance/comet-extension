export enum StateType {
  Loading = 'loading',
  NoWallet = 'no-wallet',
  Hydrated = 'hydrated',
}

export type Token = {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
};

export type BaseAsset = Token & {
  minBorrow: bigint;
  priceFeed: string;
};

export type AssetInfo = Token & {
  priceFeed: string;
  collateralFactor: bigint;
  liquidateCollateralFactor: bigint;
  liquidationFactor: bigint;
  supplyCap: bigint;
};

export type TokenWithState = AssetInfo & {
  totalSupply: bigint;
  price: bigint;
};

export type BaseAssetWithState = BaseAsset & {
  balanceOfComet: bigint;
  price: bigint;
};

export type ProtocolState = {
  baseAsset: BaseAssetWithState;
  borrowAPR: bigint;
  borrowRewardsAPR: bigint;
  collateralAssets: TokenWithState[];
  earnAPR: bigint;
  earnRewardsAPR: bigint;
};

export type TokenWithAccountState = TokenWithState & {
  allowance: bigint;
  balance: bigint;
  bulkerAllowance: bigint;
  walletBalance: bigint;
};

export type BaseAssetWithAccountState = BaseAssetWithState & {
  allowance: bigint;
  balance: bigint;
  borrowCapacity: bigint;
  bulkerAllowance: bigint;
  walletBalance: bigint;
};

export type TokenWithMarketState = TokenWithState & {
  liquidationPenalty: bigint;
  reserves: bigint;
  supplyCap: bigint;
  totalSupply: bigint;
};

export type ProtocolAndAccountState = Omit<ProtocolState, 'baseAsset' | 'collateralAssets'> & {
  baseAsset: BaseAssetWithAccountState;
  collateralAssets: TokenWithAccountState[];
  collateralValue: bigint;
  isBulkerAllowed: boolean;
  liquidationCapacity: bigint;
};

export type MarketHistoricalBucket = {
  blockTimestamp: number;
  supplyTotal: number;
  borrowTotal: number;
  supplyRate: number;
  borrowRate: number;
};

export type ProtocolAndMarketsState = Omit<ProtocolState, 'collateralAssets'> & {
  borrowRates: [bigint, number][];
  collateralAssets: TokenWithMarketState[];
  cometAddress: string;
  factorScale: number;
  marketHistory: MarketHistoricalBucket[];
  reserves: bigint;
  rewardsAsset?: Token;
  supplyRates: [bigint, number][];
  targetReserves: bigint;
  totalBorrow: bigint;
  totalSupply: bigint;
  utilization: bigint;
  type: 'ProtocolAndMarketState';
};

export type CometStateLoading = [StateType.Loading, undefined | ProtocolState];
export type CometStateNoWallet = [StateType.NoWallet, ProtocolState];
export type CometStateHydrated = [StateType.Hydrated, ProtocolAndAccountState];
export type CometState = CometStateLoading | CometStateNoWallet | CometStateHydrated;
