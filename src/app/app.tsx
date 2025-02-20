// React Query automates all of this (Caching, Automatic Refetching, Error Handling) with a simpler API. React Query simplifies data fetching by handling Caching, Automatic Refetching, Error Handling.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClusterProvider } from '../components/cluster/cluster-data-access'
import { SolanaProvider } from '../components/solana/solana-provider'
import { AppRoutes } from './app-routes'

// This creates a new instance of QueryClient, which manages query caching, fetching, and updating
const client = new QueryClient()

export function App() {
  return (
    // //The QueryClientProvider makes the QueryClient available to all child components
    <QueryClientProvider client={client}> 
      <ClusterProvider>
        <SolanaProvider>
          <AppRoutes />
        </SolanaProvider>
      </ClusterProvider>
    </QueryClientProvider>
  )
}
