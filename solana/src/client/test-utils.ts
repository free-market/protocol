import { Connection, Keypair } from '@solana/web3.js'

export async function createSolanaUser(connection: Connection, lamports?: number): Promise<Keypair> {
  const user = Keypair.generate()
  if (lamports) {
    const airdropSignature = await connection.requestAirdrop(user.publicKey, lamports)
    const latestBlockHash = await connection.getLatestBlockhash()
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    })
  }
  return user
}
