import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import BlogIDL from '../target/idl/blog.json'
import type { Blog } from '../target/types/blog'

// Re-export the generated IDL and type
export { Blog, BlogIDL }

// The programId from IDL
export const BLOG_PROGRAM_ID = new PublicKey(BlogIDL.address)

// Get the Blog program instance
export function getBlogProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program(
    { ...BlogIDL, address: address ? address.toBase58() : BlogIDL.address } as Blog,
    provider
  )
}

// Get Blog Program ID for different clusters
export function getBlogProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return new PublicKey('6oppHjv5Nzxg2DrrtHHQZ7qAgMVDszTf9JHBMgYNt5dU') // deployed program ID
    case 'mainnet-beta':
    default:
      return BLOG_PROGRAM_ID
  }
}

// Generate Blog PDA (Program Derived Address) based on title and owner
export async function getBlogPda(title: string, owner: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("blog"), owner.toBuffer(), Buffer.from(title)],
    BLOG_PROGRAM_ID
  )
}



