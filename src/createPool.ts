import { BN } from 'bn.js';

import {
  Liquidity,
  Token,
} from '@raydium-io/raydium-sdk';
import {
  Keypair,
  PublicKey,
  SendTransactionError
} from '@solana/web3.js';

import {
  connection,
  makeTxVersion,
  PROGRAMIDS,
  maxLamports,
  feeDestinationId
} from './config';
import {
  buildAndSendTx,
  getWalletTokenAccount,
} from './util';

const ZERO = new BN(0)
type BN = typeof ZERO

type CalcStartPrice = {
  addBaseAmount: BN
  addQuoteAmount: BN
}

export function calcMarketStartPrice(input: CalcStartPrice) {
  return input.addBaseAmount.toNumber() / 10 ** 6 / (input.addQuoteAmount.toNumber() / 10 ** 6)
}

type LiquidityPairTargetInfo = {
  baseToken: Token
  quoteToken: Token
  targetMarketId: PublicKey
}

export function getMarketAssociatedPoolKeys(input: LiquidityPairTargetInfo) {
  return Liquidity.getAssociatedPoolKeys({
    version: 4,
    marketVersion: 3,
    baseMint: input.baseToken.mint,
    quoteMint: input.quoteToken.mint,
    baseDecimals: input.baseToken.decimals,
    quoteDecimals: input.quoteToken.decimals,
    marketId: input.targetMarketId,
    programId: PROGRAMIDS.AmmV4,
    marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
  })
}

type WalletTokenAccounts = Awaited<ReturnType<typeof getWalletTokenAccount>>
type TestTxInputInfo = LiquidityPairTargetInfo &
  CalcStartPrice & {
    startTime: number // seconds
    walletTokenAccounts: WalletTokenAccounts
    wallet: Keypair
  }

export async function ammCreatePool(input: TestTxInputInfo): Promise<{ txids: string[], poolId: PublicKey }> {
  // -------- step 1: make instructions --------
  try {
  const initPoolInstructionResponse = await Liquidity.makeCreatePoolV4InstructionV2Simple({
    connection,
    programId: PROGRAMIDS.AmmV4,
    marketInfo: {
      marketId: input.targetMarketId,
      programId: PROGRAMIDS.OPENBOOK_MARKET,
    },
    baseMintInfo: input.baseToken,
    quoteMintInfo: input.quoteToken,
    baseAmount: input.addBaseAmount,
    quoteAmount: input.addQuoteAmount,
    startTime: new BN(Math.floor(input.startTime)),
    ownerInfo: {
      feePayer: input.wallet.publicKey,
      wallet: input.wallet.publicKey,
      tokenAccounts: input.walletTokenAccounts,
      useSOLBalance: true,
    },
    associatedOnly: false,
    checkCreateATAOwner: true,
    computeBudgetConfig: {
      microLamports: maxLamports,
    },
    makeTxVersion,
    feeDestinationId
  })
  console.log("Pool ID: ", initPoolInstructionResponse.address.ammId);
  return { txids: await buildAndSendTx(initPoolInstructionResponse.innerTransactions), poolId: initPoolInstructionResponse.address.ammId };
} catch (error) {
  if (error instanceof SendTransactionError) {
    console.error("Transaction failed:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
  throw error; // Rethrow the error if needed
}
}