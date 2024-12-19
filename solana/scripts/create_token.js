import  { default as anchor } from "@coral-xyz/anchor";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import token_minter_idl from "../target/idl/token_minter.json" with { type: 'json' };

async function init_token() {
  // 0. Load wallet from local file
  const walletPath = path.resolve(process.env.HOME, ".config/solana/id.json");
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  // 1. Set up the provider
  const connection = new Connection("https://api.devnet.solana.com");
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), {});
  anchor.setProvider(provider);
  console.log("Provider:", provider);

  // 2. Load the program IDL and create a program instance
  const program = new anchor.Program(token_minter_idl, provider);
  const programId = new PublicKey(token_minter_idl.address);
  console.log("Program ID:", programId.toString());
  
  // 3. Find the mint PDA
  const [mintPda, mintBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    programId
  );

  // 4. Find the metadata PDA
  const [metadataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(), // Metaplex Metadata Program ID
      mintPda.toBuffer(),
    ],
    new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s") // Metaplex Metadata Program ID
  );
  
  // 5. Define the token parameters
  const initTokenParams = {
    name: "JustinTestToken",
    symbol: "JTT",
    uri: "https://justinmadev.github.io/",
    decimals: 5,
  };

  // 6. Call the init_token method
  try {
    const tx = await program.methods
    .initToken(initTokenParams)
    .accounts({
        metadata: metadataPda,
        mint: mintPda,
        payer: provider.wallet.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        tokenMetadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
    })
    .signers([])
    .rpc();

    console.log("Transaction successful. Signature:", tx);
    console.log("Mint PDA:", mintPda.toString());
    console.log("Metadata PDA:", metadataPda.toString());
  } catch (err) {
    console.error("Transaction failed:", err);
  }
};

async function mint_token(){
  // 0. Load wallet from local file
  const walletPath = path.resolve(process.env.HOME, ".config/solana/id.json");
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  // 1. Set up the provider
  const connection = new Connection("https://api.devnet.solana.com");
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), {});
  anchor.setProvider(provider);
  console.log("Provider:", provider);

  // 2.  Load the program IDL and create a program instance
  const program = new anchor.Program(token_minter_idl, provider);
  const programId = new PublicKey(token_minter_idl.address);
  console.log("Program ID:", programId.toString());

  // 3. Find the mint PDA
  const [mintPda, mintBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    programId
  );
  
  const payer = provider.wallet.publicKey;
  // You can use any Solana wallet account as the receiver
  const receiver = new PublicKey("3VW79TUVeb5wpC8NhqrqyuUekdJyncfEfoxeMwqJuJyb");
  const destinationAccount = anchor.utils.token.associatedAddress({
    mint: mintPda,
    owner: receiver,
  });

  console.log("destinationAccount:", destinationAccount.toString());
  console.log("payer:", payer.toString());

  // 4. Define the quantity of tokens to mint
  const quantity = new anchor.BN("100000000"); // 1000 JTT

  try{
    // 5. Call the mint_tokens method
    const tx = await program.methods
      .mintTokens(quantity)
      .accounts({
        mint: mintPda,
        destination: destinationAccount,
        receiver: receiver,
        payer: payer,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId, 
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      })
      .signers([])
      .rpc();

    console.log("Transaction successful. Signature:", tx);
  } catch (err) {
    console.error("Transaction failed:", err);
  }
}
/*
async function rm_auth(){
  
  // 0. Load wallet from local file
  const walletPath = path.resolve(process.env.HOME, ".config/solana/id.json");
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  // 1. Set up the provider
  const connection = new Connection("https://api.devnet.solana.com");
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), {});
  anchor.setProvider(provider);
  console.log("Provider:", provider);

  // 2.  Load the program IDL and create a program instance
  const program = new anchor.Program(token_minter_idl, provider);
  const programId = new PublicKey(token_minter_idl.address);
  console.log("Program ID:", programId.toString());

  const payer = provider.wallet.publicKey;

  // 3. Find the mint PDA
  const [mintPda, mintBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    programId
  );
  try{
    const tx = await program.methods
    .rmAuth()
    .accounts({
      mint: mintPda,
      payer: payer,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    })
    .signers([])
    .rpc();
  }catch(err){
    console.error("Transaction failed:", err);
  }
} //*/
//await init_token();
await mint_token();
//await rm_auth();