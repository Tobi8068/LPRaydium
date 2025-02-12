import { MarketV2, MAINNET_PROGRAM_ID, DEVNET_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { makeTxVersion, lotSize, tickSize } from "./config";

export async function createMarketId (connection: Connection, wallet: Keypair, baseTokenMintAddress: string, quoteTokenMintAddress: string) {
    const RAYDIUM_PROGRAM_ID = process.env.NETWORK == 'mainnet' ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID
    const basePubkey = new PublicKey(baseTokenMintAddress)
    const baseMintAccount = await getMint(connection, basePubkey)
    const quotePubkey = new PublicKey(quoteTokenMintAddress)
    const quoteMintAccount = await getMint(connection, quotePubkey)
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
}