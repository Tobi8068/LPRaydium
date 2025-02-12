import assert from 'assert';
import { MARKET_STATE_LAYOUT_V3, Percent, SPL_MINT_LAYOUT, Token, TOKEN_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import { PublicKey } from '@solana/web3.js';
import { getMint } from "@solana/spl-token";
import { BN } from 'bn.js';
import { ammCreatePool } from "./createPool";
import { createMarketId } from './createMarketId';
import { ammAddLiquidity } from './addLiquidity';
import { connection, wallet, baseTokenAmount, quoteTokenAmount, baseTokenMint, quoteTokenMint } from './config';
import { checkTxRes, getWalletTokenAccount } from './util';

async function main() {

    const marketId = await createMarketId(connection, wallet, baseTokenMint, quoteTokenMint)

    if (!marketId) return

    const marketBufferInfo = await connection.getAccountInfo(new PublicKey("EhFXb5iDPwJisGW5CqmXtw7v6juD8uqQFKP5y3N55cko"))

    if (!marketBufferInfo) {
        console.error(`Market account not found at address: ${marketId}`);
        return;
    }
    const basePubkey = new PublicKey(baseTokenMint)
    const quotePubkey = new PublicKey(quoteTokenMint)
    const baseAccountInfo = await connection.getAccountInfo(basePubkey);
    const quoteAccountInfo = await connection.getAccountInfo(quotePubkey);
    const baseMintAccount = await getMint(connection, basePubkey, undefined, baseAccountInfo?.owner);
    const quoteMintAccount = await getMint(connection, quotePubkey, undefined, quoteAccountInfo?.owner)
    const baseToken = new Token(TOKEN_PROGRAM_ID, basePubkey, baseMintAccount.decimals)
    const quoteTokenInfo = await connection.getAccountInfo(quotePubkey)
    assert(quoteTokenInfo?.data, `Can't find quote token ${quotePubkey.toString()}`)
    const quoteMintInfo = SPL_MINT_LAYOUT.decode(quoteTokenInfo.data)
    const quoteToken = new Token(TOKEN_PROGRAM_ID, quotePubkey, quoteMintAccount.decimals)

    const amount1 = baseTokenAmount * (10 ** baseMintAccount.decimals)
    const amount2 = quoteTokenAmount * (10 ** quoteMintAccount.decimals)
    const addBaseAmount = new BN(amount1.toString(), 10)
    const addQuoteAmount = new BN(amount2.toString(), 10)

    const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)

    let txSuccess: boolean = false;

    const startTime = Date.now();

    while (!txSuccess) {
        const poolId = await ammCreatePool({
            startTime,
            addBaseAmount,
            addQuoteAmount,
            baseToken,
            quoteToken,
            targetMarketId: marketId,
            wallet,
            walletTokenAccounts
        })
        console.log('poolId', poolId)
        const txinf = await ammAddLiquidity({
            targetPool: poolId.toString(),
            inputTokenAmount: 0,
            slippage: new Percent(25, 10000),
            walletTokenAccounts,
            wallet
        })

        txSuccess = await checkTxRes(txinf.txids[0], Date.now())

        if (txSuccess) console.log(`## Creating and initializing new pool to : Tx: https://solscan.io/tx/${txinf.txids[0]}`);
        else console.log(` - Try sending Tx again to create a new pool and add liquidity`)
    }
}


main();