'use client'

import { getBlogProgram, getBlogProgramId } from '@project/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey, SystemProgram } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

interface CreateEntryArgs {
  title: string;
  description: string;
  owner: PublicKey;
}

/** 
 * useBlogProgram
 * 
 * Provides:
 *  - program: The Anchor program instance
 *  - programId: The program's PublicKey
 *  - accounts: Query fetching all BlogEntryState accounts
 *  - getProgramAccount: Query fetching parsed account info for the program
 *  - createBlog: Mutation to create a new blog entry
 */
export function useBlogProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();

  // Derive the correct program ID based on the current cluster
  const programId = useMemo(() => getBlogProgramId(cluster.network as Cluster), [cluster]);

  // Get an instance of the program from your Anchor provider
  const program = getBlogProgram(provider);

  // Fetch all blog entries
  const accounts = useQuery({
    queryKey: ['blog', 'all', { cluster }],
    queryFn: () => program.account.blogEntryState.all(),
  });

  // Fetch specific program account info (if needed)
  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  // Create Blog Entry
  const createBlog = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ['blogEntry', 'create', { cluster }],
    mutationFn: async ({ title, description, owner }) => {
      // Derive the PDA address for the blog entry
      const [blogEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(title), owner.toBuffer()],
        program.programId
      );

      // The name "blogEntry" in .accounts({}) must match what the IDL expects.
      // If your IDL has it as "blog_entry", update accordingly.
      return program.methods
        .createBlog(title, description)
        .accounts({
          blogEntry: blogEntryPDA,
          owner,
          system_program: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error creating a blog: ${error.message}`);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createBlog,
  };
}

/** 
 * useBlogProgramAccount
 * 
 * Provides:
 *  - accountQuery: Query fetching a single BlogEntryState account
 *  - updateBlog: Mutation to update a blog entry
 *  - deleteBlog: Mutation to delete (close) a blog entry
 *  - programId: The program's PublicKey (hard-coded or derived)
 */
export function useBlogProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useBlogProgram();

  // If you want to use the same dynamic ID from the cluster, you can use
  // the one returned from useBlogProgram() instead of a hard-coded ID.
  // For now, you can keep this if you prefer:
  const programId = new PublicKey('FLbwydxCq8AT5PbhiqZpvgTAXv4VnfvbYjMR7cg5WSLA');

  // Fetch the individual blog entry data by its PDA
  const accountQuery = useQuery({
    queryKey: ['blog', 'fetch', { cluster, account }],
    queryFn: () => program.account.blogEntryState.fetch(account),
  });

  // Update Blog Entry
  const updateBlog = useMutation<string, Error, { title: string; description: string; owner: PublicKey }>({
    mutationKey: ['blogEntry', 'update', { cluster }],
    mutationFn: async ({ description, owner }) => {
      // The .accounts() must match the IDL's required accounts
      return program.methods
        .updateBlog(description)
        .accounts({
          blogEntry: account,
          owner,
          system_program: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update blog: ${error.message}`);
    },
  });

  // Delete Blog Entry
  const deleteBlog = useMutation<string, Error, { title: string; owner: PublicKey }>({
    mutationKey: ['blog', 'deleteBlog', { cluster, account }],
    mutationFn: async ({ title, owner }) => {
      // Derive the same PDA used for creation
      const [blogEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(title), owner.toBuffer()],
        program.programId
      );

      return program.methods
        .deleteBlog(title)
        .accounts({
          blogEntry: blogEntryPDA,
          owner,
          system_program: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      accounts.refetch();
    },
  });

  return {
    accountQuery,
    updateBlog,
    deleteBlog,
    programId,
  };
}
