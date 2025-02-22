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

// useBlogProgram
export function useBlogProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();

  // Derive the correct program ID based on the current cluster.
  const programId = useMemo(
    () => getBlogProgramId(cluster.network as Cluster),
    [cluster]
  );

  // Get an instance of the program from your Anchor provider.
  const program = getBlogProgram(provider);

  // Fetch all blog entries.
  const accounts = useQuery({
    queryKey: ['blog', 'all', { cluster }],
    queryFn: () => program.account.blogEntryState.all(),
  });

  // Fetch specific program account info (if needed).
  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  // Create Blog Entry using PDA seeds: [b"blog", owner, title]
  const createBlog = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ['blogEntry', 'create', { cluster }],
    mutationFn: async ({ title, description, owner }) => {
      const [blogEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("blog"), owner.toBuffer(), Buffer.from(title)],
        program.programId
      );
      console.log("Derived PDA:", blogEntryPDA.toBase58());
      console.log("Owner Buffer:", owner.toBuffer().toString('hex'));
      console.log("Title Buffer:", Buffer.from(title).toString('hex'));

      return program.methods
        .createBlog(title, description) //Calls the program method createBlog with the title and description
        .accounts({
          blogEntry: blogEntryPDA, //The derived PDA for the blog entry
          owner, //The owner’s public key
          system_program: SystemProgram.programId, //The system program’s public key (for account creation)
        })
        .rpc(); //Calls to send the transaction
    },
    onSuccess: (signature) => { // Displays a toast using transactionToast
      transactionToast(signature); 
      accounts.refetch(); //Refetches the accounts query to update the list of blog entries
    },
    // Shows an error toast if something goes wrong
    onError: (error) => {
      toast.error(`Error creating a blog: ${error.message}`); 
    },
  });

  // Returns an object from useBlogProgram Hook
  return {
    program, //The program instance
    programId, //The program’s public key
    accounts, //Query for all blog entries
    getProgramAccount, //Query for program account info
    createBlog, //Mutation for creating a new blog entry
  };
}

/**
 * useBlogProgramAccount
 *
 * Provides:
 *  - accountQuery: Query fetching a single BlogEntryState account
 *  - updateBlog: Mutation to update a blog entry
 *  - deleteBlog: Mutation to delete (close) a blog entry
 *  - programId: The program's PublicKey
 */
export function useBlogProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useBlogProgram();

  // Use the same programId as used in useBlogProgram.
  const programId = new PublicKey('FLbwydxCq8AT5PbhiqZpvgTAXv4VnfvbYjMR7cg5WSLA');

  // Fetch the individual blog entry data by its PDA.
  const accountQuery = useQuery({
    queryKey: ['blog', 'fetch', { cluster, account }],
    queryFn: () => program.account.blogEntryState.fetch(account),
  });

  // Update Blog Entry.
  // Pass the original title so that the PDA can be re-derived.
  const updateBlog = useMutation<
    string,
    Error,
    { title: string; newDescription: string; owner: PublicKey }
  >({
    mutationKey: ['blogEntry', 'update', { cluster }],
    mutationFn: async ({ title, newDescription, owner }) => {
      const [blogEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("blog"), owner.toBuffer(), Buffer.from(title)],
        program.programId
      );

      return program.methods
        .updateBlog(title, newDescription)
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
      toast.error(`Failed to update blog: ${error.message}`);
    },
  });

  // Delete Blog Entry.
  // Pass the same title for PDA derivation.
  const deleteBlog = useMutation<string, Error, { title: string; owner: PublicKey }>({
    mutationKey: ['blog', 'deleteBlog', { cluster, account }],
    mutationFn: async ({ title, owner }) => {
      const [blogEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("blog"), owner.toBuffer(), Buffer.from(title)],
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
