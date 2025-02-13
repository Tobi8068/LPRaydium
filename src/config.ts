import {
    LOOKUP_TABLE_CACHE,
    MAINNET_PROGRAM_ID,
    DEVNET_PROGRAM_ID,
    TxVersion,
} from '@raydium-io/raydium-sdk';
import {
    Connection,
    Keypair,
    PublicKey
} from '@solana/web3.js';
import 'dotenv/config';
import base58 from "bs58"

const RPC_URL = process.env.RPC_URL || "";
const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const network = process.env.NETWORK; 
export const maxLamports = 1000000; //almost 0.001 SOL fee
export const wallet = Keypair.fromSecretKey(Buffer.from(base58.decode(WALLET_PRIVATE_KEY)))
export const timeOut = 1000 * 30;
export const rpcToken: string | undefined = undefined
export const connection = new Connection(RPC_URL, {commitment: 'confirmed'});
export const PROGRAMIDS = network == "mainnet" ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;
export const feeDestinationId = network == "mainnet" ? new PublicKey('7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5') : new PublicKey('3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR');
export const makeTxVersion = TxVersion.V0;
export const baseTokenMint = process.env.BASE_TOKEN || "";
export const quoteTokenMint = process.env.QUOTE_TOKEN || "";
export const baseTokenAmount = Number(process.env.BASE_TOKEN_AMOUNT) || 0;
export const quoteTokenAmount = Number(process.env.QUOTE_TOKEN_AMOUNT) || 0;
export const addLookupTableInfo = network == 'mainnet' ? LOOKUP_TABLE_CACHE : undefined;
export const lotSize = Number(process.env.LOT_SIZE) || 1;
export const tickSize = Number(process.env.TICK_SIZE) || 0.01;
export const tipAcct = new PublicKey('Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY');
export const inputAmountToAddLiquidity = Number(process.env.BASE_TOKEN_AMOUNT_FOR_ADD_LIQUIDITY) || 0;