import { MarketV2 } from "@raydium-io/raydium-sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getMint, TokenAccountNotFoundError } from "@solana/spl-token";
import { makeTxVersion, lotSize, tickSize, PROGRAMIDS } from "./config";
import { buildAndSendTx } from "./util";

export async function createMarketId(connection: Connection, wallet: Keypair, baseTokenMintAddress: string, quoteTokenMintAddress: string) {
    try {
        const basePubkey = new PublicKey(baseTokenMintAddress)
        const quotePubkey = new PublicKey(quoteTokenMintAddress)
        const baseAccountInfo = await connection.getAccountInfo(basePubkey);
        const quoteAccountInfo = await connection.getAccountInfo(quotePubkey);
        const baseMintAccount = await getMint(connection, basePubkey, undefined, baseAccountInfo?.owner);
        const quoteMintAccount = await getMint(connection, quotePubkey, undefined, quoteAccountInfo?.owner)
        const { innerTransactions, address } = await MarketV2.makeCreateMarketInstructionSimple({
            connection,
            wallet: wallet.publicKey,
            baseInfo: {
                mint: basePubkey,
                decimals: baseMintAccount.decimals
            },
            quoteInfo: {
                mint: quotePubkey,
                decimals: quoteMintAccount.decimals
            },
            lotSize: lotSize, // default 1
            tickSize: tickSize, // default 0.01
            dexProgramId: PROGRAMIDS.OPENBOOK_MARKET,
            makeTxVersion,
        })

        await buildAndSendTx(innerTransactions, { skipPreflight: true })
        return address.marketId
    } catch (error) {
        if (error instanceof TokenAccountNotFoundError) {
            console.error('Mint account not found. Please check the mint address.');
            return
        } else {
            console.error('An unexpected error occurred:', error);
            return
        }
    }

}