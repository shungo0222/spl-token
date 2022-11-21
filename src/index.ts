import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { initializeKeypair } from "./initializeKeypair";

async function createTokenAccount(
    connection: web3.Connection,
    payer: web3.Keypair,
    mint: web3.PublicKey,
    owner: web3.PublicKey,
) {
    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        owner,
    );

    console.log(`Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`);

    return tokenAccount;
}

async function transferTokens(
    connection: web3.Connection,
    payer: web3.Keypair,
    source: web3.PublicKey,
    destination: web3.PublicKey,
    owner: web3.PublicKey,
    amount: number,
    mint: web3.PublicKey,
) {
    const mintInfo = await token.getMint(connection, mint);

    const transactionSignature = await token.transfer(
        connection,
        payer,
        source,
        destination,
        owner,
        amount * 10 ** mintInfo.decimals
    );

    console.log(`Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);
}

async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
    const signer = await initializeKeypair(connection);

    console.log("PublicKey:", signer.publicKey.toBase58());

    // recipient wallet address
    const recipient = new web3.PublicKey("CMyVqDXtbFrEzvFtqxu3hP38T22dbrSrAqCxtuDzKeBs");
    // token mint account address
    const mint = new web3.PublicKey("GP4HNLenSuppcbtKRSybuwbNU6PHeTzp7PkzWi9mjtoB");
    // associated token account of the token of the sender
    const ata = new web3.PublicKey("wxqPiKTLTZacLeqARwPsNLBkRWvJw8WiGwGsHmszhyp");
    // the amount of token you want to send
    const amount = 10;

    // create the associated token account of the token of the recipient
    const recipientTokenAccount = await createTokenAccount(
        connection,
        signer,
        mint,
        recipient,
    );

    await transferTokens(
        connection,
        signer,
        ata,
        recipientTokenAccount.address,
        signer.publicKey,
        amount,
        mint,
    );
}

main()
    .then(() => {
        console.log("Finished successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    })
