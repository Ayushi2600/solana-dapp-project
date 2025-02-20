"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useBlogProgram } from "./blog-data-access";
import { BlogCreate, BlogList } from "./blog-ui";

export default function BlogFeature() {
  const { publicKey } = useWallet();
  const { programId } = useBlogProgram();

  // If wallet is connected, show the blog UI
  if (publicKey) {
    return (
      <div className="max-w-4xl mx-auto">
        <AppHero
          title="My Solana Blog"
          subtitle="Create your blog here!"
        >
          <p className="mb-6">
            Program ID:{" "}
            <ExplorerLink
              path={`account/${programId}`}
              label={ellipsify(programId.toString())}
            />
          </p>
          <BlogCreate />
        </AppHero>

        <div className="mt-8">
          <BlogList />
        </div>
      </div>
    );
  }

  // Otherwise, show a prompt to connect the wallet
  return (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <div className="space-y-4">
            <p className="text-lg font-semibold">
              Please connect your wallet to create or view blogs.
            </p>
            <WalletButton />
          </div>
        </div>
      </div>
    </div>
  );
}
