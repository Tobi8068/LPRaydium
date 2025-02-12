import assert from 'assert';
import { MARKET_STATE_LAYOUT_V3, Percent, SPL_MINT_LAYOUT, Token, TOKEN_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import { PublicKey } from '@solana/web3.js';
import { BN } from 'bn.js';
import { ammCreatePool } from "./createPool";
import { createMarketId } from './createMarketId';
import { ammAddLiquidity } from './addLiquidity';
import { connection, wallet, baseTokenAmount, quoteTokenAmount, baseTokenMint, quoteTokenMint } from './config';
import { checkTxRes, getWalletTokenAccount } from './util';

async function main() {

    const marketId = await createMarketId(connection, wallet, baseTokenMint, quoteTokenMint)
    
    const marketBufferInfo = await connection.getAccountInfo(new PublicKey(marketId))

    if (!marketBufferInfo) {
        console.error(`Market account not found at address: ${marketId}`);
        return;
    }
    const { baseMint, quoteMint } = MARKET_STATE_LAYOUT_V3.decode(marketBufferInfo.data)
    const baseTokenInfo = await connection.getAccountInfo(baseMint)
    assert(baseTokenInfo?.data, `Can't find base token ${baseMint.toString()}`)
    const baseMintInfo = SPL_MINT_LAYOUT.decode(baseTokenInfo.data)
    const baseToken = new Token(TOKEN_PROGRAM_ID, baseMint, baseMintInfo.decimals)
    const quoteTokenInfo = await connection.getAccountInfo(quoteMint)
    assert(quoteTokenInfo?.data, `Can't find quote token ${quoteMint.toString()}`)
    const quoteMintInfo = SPL_MINT_LAYOUT.decode(quoteTokenInfo.data)
    const quoteToken = new Token(TOKEN_PROGRAM_ID, quoteMint, quoteMintInfo.decimals)

    const amount1 = baseTokenAmount * (10 ** baseMintInfo.decimals)
    const amount2 = quoteTokenAmount * (10 ** quoteMintInfo.decimals)
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