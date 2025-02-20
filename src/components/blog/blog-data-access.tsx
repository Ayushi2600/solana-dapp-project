'use client'

import { getBlogProgram, getBlogProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { title } from 'node-stdlib-browser/mock/process'

interface CreateEntryArgs {
    title: String;
    description: String;
    owner: PublicKey;
}

export function useBlogProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getBlogProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getBlogProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['blog', 'all', { cluster }],
    queryFn: () => program.account.blogEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', {cluster}],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createBlog = useMutation<String, Error, CreateEntryArgs>({
    mutationKey: [`blogEntry`, `create`, {cluster}],
    mutationFn: async ({ title, description, owner}) => {
        return program.methods.createBlog(title, description, {accounts: {owner}}.rpc());
    },
    onSuccess: (signature) => {
        transactionToast(signature);
        accounts.refetch();
    },
    onError: (error) => {
        toast.error(`Error creating a blog: ${error.message}`);
    }
  });

  const initialize = useMutation({
    mutationKey: ['blog', 'create', { cluster }],
    mutationFn: ({ keypair, title, description }) =>
      program.methods
        .createBlog(title, description)
        .accounts({ blogEntry: keypair.publicKey, owner: provider.wallet.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to create blog entry'),
  });

  return {
    program,
    programId,
    accounts,
    initialize,
  }
}

