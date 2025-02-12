import { MarketV2, MAINNET_PROGRAM_ID, DEVNET_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getMint, TokenAccountNotFoundError } from "@solana/spl-token";
import { makeTxVersion, lotSize, tickSize } from "./config";

export async function createMarketId(connection: Connection, wallet: Keypair, baseTokenMintAddress: string, quoteTokenMintAddress: string) {
    const RAYDIUM_PROGRAM_ID = process.env.NETWORK == 'mainnet' ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID
    try {
        const basePubkey = new PublicKey(baseTokenMintAddress)
        const quotePubkey = new PublicKey(quoteTokenMintAddress)
        const baseAccountInfo = await connection.getAccountInfo(basePubkey);
        const quoteAccountInfo = await connection.getAccountInfo(quotePubkey);
        const baseMintAccount = await getMint(connection, basePubkey, undefined, baseAccountInfo?.owner);
        const quoteMintAccount = await getMint(connection, quotePubkey, undefined, quoteAccountInfo?.owner)
        const createMarketInstruments = await MarketV2.makeCreateMarketInstructionSimple({
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
            dexProgramId: RAYDIUM_PROGRAM_ID.OPENBOOK_MARKET,
            makeTxVersion,
        })

        let marketId = createMarketInstruments.address.marketId
        return marketId
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