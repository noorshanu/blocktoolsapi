const solanaWeb3 = require("@solana/web3.js");
const { Connection, Keypair,PublicKey, Transaction,LAMPORTS_PER_SOL, sendAndConfirmTransaction } = solanaWeb3;
const bs58 = require("bs58");


module.exports ={
  sendSolana : async (
  fromWallet,
  toWallet,
  amount,
  RPC_URL
) => {
  try {
    const SolanaConnection = new Connection( RPC_URL , "confirmed");
    const FromWallet = Keypair.fromSecretKey(
      bs58.decode(fromWallet.toString())
    );
    const transaction = new Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: FromWallet.publicKey,
        toPubkey: toWallet,
        lamports: amount * 1000000000,
      })
    );

    const { blockhash } = await SolanaConnection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = FromWallet.publicKey;

        const signature = await solanaWeb3.sendAndConfirmTransaction(
            SolanaConnection,
            transaction,
            [FromWallet],
        );

    return signature;
  } catch (error) {
    throw error;
  }
},
 solBalance : async (RPC_URL,privateKey) => {
    try {
     const connection = new Connection( RPC_URL , "confirmed");
     const FromWallet = Keypair.fromSecretKey(
        bs58.decode(privateKey.toString())
      );
      const balance = await connection.getBalance(FromWallet.publicKey);
      return balance;
    }catch (error) {
        throw error;
      }
  },
  getSolBalance : async (RPC_URL,publicKey) => {
    try {
     const connection = new Connection( RPC_URL , "confirmed");
      const balance = await connection.getBalance(new PublicKey(publicKey));
      return balance/LAMPORTS_PER_SOL;
    }catch (error) {
        throw error;
      }
  },
 
  
}
