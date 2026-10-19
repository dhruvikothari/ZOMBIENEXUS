import type { InterfaceAbi, TransactionReceipt } from 'ethers';

export type Zombie = { id: number; name: string; dna: bigint; level: number; readyTime: number; winCount: number; lossCount: number; owner: string };
export type Avenger = { id: number; genes: bigint; birthTime: number; heroIndex: number; heroName: string; power: number };
export type Rarity = 'common' | 'rare' | 'hero';
export type Head = { blockNumber: number; timestamp: number };
export type WalletStatus = 'no-metamask' | 'disconnected' | 'connecting' | 'wrong-network' | 'no-contract' | 'rpc-down' | 'ready';
export type WalletState = { status: WalletStatus; address: string | null; chainId: number | null; balance: bigint | null; reason: string | null; providerName: string | null };
export type ErrorKind = 'rejected' | 'funds' | 'network' | 'reverted' | 'unknown';
export type AppError = { kind: ErrorKind; message: string; detail?: string };
export type TxStatus = 'idle' | 'awaiting-signature' | 'pending' | 'confirmed' | 'reverted' | 'rejected' | 'failed';
export type TxState = { status: TxStatus; label: string; hash: string | null; receipt: TransactionReceipt | null; error: AppError | null };
export type ContractInfo = { address: string; abi: InterfaceAbi };
export type Deployment = { chainId: number; networkName: string; rpcUrl: string; deployedAtBlock: number; generatedAt: string; contracts: { ZombieOwnership: ContractInfo; AvengerContract: ContractInfo } };
export type ActivityItem = { key: string; event: string; contract: 'ZombieOwnership' | 'AvengerContract'; args: Record<string, string>; blockNumber: number; timestamp: number; txHash: string; from: string; gasUsed: bigint };
export type Loadable<T> = { data: T | null; loading: boolean; error: AppError | null; refetch: () => void };
