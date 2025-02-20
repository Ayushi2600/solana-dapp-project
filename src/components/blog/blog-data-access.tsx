import { getBlogProgram, getBlogProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

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
  })

  return {
    program,
    programId,
    accounts,
    initialize,
  }
}

export function useBlogProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useBlogProgram()

  const accountQuery = useQuery({
    queryKey: ['blog', 'fetch', { cluster, account }],
    queryFn: () => program.account.blogEntryState.fetch(account),
  })

  const updateMutation = useMutation({
    mutationKey: ['blog', 'update', { cluster, account }],
    mutationFn: (newDescription) =>
      program.methods
        .updateBlog(newDescription)
        .accounts({ blogEntry: account, owner: provider.wallet.publicKey })
        .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const deleteMutation = useMutation({
    mutationKey: ['blog', 'delete', { cluster, account }],
    mutationFn: () =>
      program.methods
        .deleteBlog()
        .accounts({ blogEntry: account, owner: provider.wallet.publicKey })
        .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  return {
    accountQuery,
    updateMutation,
    deleteMutation,
  }
}
