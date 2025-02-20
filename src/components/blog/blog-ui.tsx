"use client";

import { PublicKey } from "@solana/web3.js";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useBlogProgram,
  useBlogProgramAccount,
} from "./blog-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

/** =========================
 *      BlogCreate
 *  =========================
 *  This component creates a new blog entry with a title and description.
 */
export function BlogCreate() {
  const { createBlog } = useBlogProgram();
  const { publicKey } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const isFormValid = title.trim() !== "" && description.trim() !== "";

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      // Create uses the static PDA derivation, so we pass the title only for logging.
      createBlog.mutateAsync({ title, description, owner: publicKey });
    }
  };

  if (!publicKey) {
    return <p className="text-center">Connect your wallet</p>;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-semibold">Create a Blog Entry</div>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full max-w-sm"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="textarea textarea-bordered w-full max-w-sm"
      />
      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={createBlog.isPending || !isFormValid}
      >
        {createBlog.isPending ? "Creating..." : "Create"}
      </button>
    </div>
  );
}

/** =========================
 *      BlogList
 *  =========================
 *  This component displays all existing blog entries in card form.
 */
export function BlogList() {
  const { accounts, getProgramAccount } = useBlogProgram();

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info max-w-lg mx-auto">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }

  if (accounts.isLoading) {
    return (
      <div className="flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const blogAccounts = accounts.data || [];

  return (
    <div className="space-y-6 mt-8">
      {blogAccounts.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-6">
          {blogAccounts.map((account) => (
            <BlogCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl mb-2">No blog entries found</h2>
          <p>Create one above to get started.</p>
        </div>
      )}
    </div>
  );
}

/** =========================
 *      BlogCard
 *  =========================
 *  Individual card to show the blog title, description, and controls for update/delete.
 */
function BlogCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateBlog, deleteBlog } = useBlogProgramAccount({
    account,
  });
  const { publicKey } = useWallet();
  const [newDescription, setNewDescription] = useState("");
  const title = accountQuery.data?.title;
  const description = accountQuery.data?.description;

  const isFormValid = newDescription.trim() !== "";

  const handleUpdate = () => {
    if (publicKey && isFormValid && title) {
      // Here, title is passed for logging purposes. The PDA is derived using static seed.
      updateBlog.mutateAsync({
        description: newDescription,
        owner: publicKey,
      });
    }
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to close this blog entry?")) {
      return;
    }
    if (title && publicKey) {
      // Similarly, title is passed only for logging; PDA derivation uses the static seed.
      deleteBlog.mutateAsync({ title, owner: publicKey });
    }
  };

  if (accountQuery.isLoading) {
    return (
      <div className="card w-64 bg-base-100 shadow-xl flex justify-center items-center p-4">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="card w-64 bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-xl break-words">
          {title ?? "Untitled"}
        </h2>
        <p className="mb-2 break-words">{description ?? "No description"}</p>

        <div className="flex flex-col space-y-2">
          <textarea
            placeholder="New description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleUpdate}
            disabled={updateBlog.isPending || !isFormValid}
          >
            {updateBlog.isPending ? "Updating..." : "Update"}
          </button>
        </div>

        <div className="divider"></div>

        <div className="text-center space-y-2">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
          />
          <button
            className="btn btn-secondary btn-outline btn-sm"
            onClick={handleDelete}
            disabled={deleteBlog.isPending}
          >
            {deleteBlog.isPending ? "Closing..." : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
