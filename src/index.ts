import { Percent, Token, TOKEN_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import { PublicKey } from '@solana/web3.js';
import { getMint } from "@solana/spl-token";
import { BN } from 'bn.js';
import { ammCreatePool } from "./createPool";
import { ammAddLiquidity } from './addLiquidity';
import { connection, wallet, baseTokenAmount, quoteTokenAmount, baseTokenMint, quoteTokenMint } from './config';
import { checkTxRes, getWalletTokenAccount } from './util';
import { createMarketId } from './createMarketId';

async function main() {

    const marketId = await createMarketId(connection, wallet, baseTokenMint, quoteTokenMint);
    // const marketId = "JC4JW6s8CnTWVBEYdA8EvG6Ku89peAwX8ZYn8s9XAXcN";
    // const marketId = "CUodeuy62D6jK6Tk6FfA8tELk5cydUT9xCUiowKQDF8S"
    await new Promise(resolve => setTimeout(resolve, 5000))

    if (marketId) {
        const marketBufferInfo = await connection.getAccountInfo(new PublicKey(marketId));
        await new Promise(resolve => setTimeout(resolve, 5000))
        if (!marketBufferInfo) {
            console.error(`Market account not found at address`);
            return;
        }
        console.log("Market Id", marketId);
        const basePubkey = new PublicKey(baseTokenMint)
        const quotePubkey = new PublicKey(quoteTokenMint)
        const baseAccountInfo = await connection.getAccountInfo(basePubkey);
        const quoteAccountInfo = await connection.getAccountInfo(quotePubkey);
        const baseMintAccount = await getMint(connection, basePubkey, undefined, baseAccountInfo?.owner);
        const quoteMintAccount = await getMint(connection, quotePubkey, undefined, quoteAccountInfo?.owner)
        const baseToken = new Token(TOKEN_PROGRAM_ID, basePubkey, baseMintAccount.decimals)
        const quoteToken = new Token(TOKEN_PROGRAM_ID, quotePubkey, quoteMintAccount.decimals)

        const amount1 = baseTokenAmount * (10 ** baseMintAccount.decimals)
        const amount2 = quoteTokenAmount * (10 ** quoteMintAccount.decimals)
        const addBaseAmount = new BN(amount1.toString(), 10)
        const addQuoteAmount = new BN(amount2.toString(), 10)

        const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)

        const startTime = Date.now()

        let txSuccess = false

        ammCreatePool({
            startTime,
            addBaseAmount,
            addQuoteAmount,
            baseToken,
            quoteToken,
            targetMarketId: new PublicKey(marketId),
            wallet,
            walletTokenAccounts
        }).then(async ({ txids, poolId }) => {
            console.log("## Creating new pool : TX : ", txids[0])
            // const poolId = new PublicKey("3KUZXNDvDiKCFaJkj3q3zrENh8FJUuffzT7bAU1YAeyU")
            const txinf = await ammAddLiquidity({
                targetPool: poolId.toBase58(),
                inputTokenAmount: 1,
                slippage: new Percent(25, 10000),
                walletTokenAccounts,
                wallet
            })

            txSuccess = await checkTxRes(txinf.txids[0], Date.now())

            if (txSuccess) console.log(`## Succeed ##`);
            else console.log(` - Try sending Tx again to create a new pool and add liquidity`)
        }).catch((err) => {
            console.log('err', err)
        })
    }
}


main();