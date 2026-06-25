"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBranch, updateBranch } from "@/lib/queries/branches";

type BranchFormProps = {
  mode: "create" | "edit";
  branchId?: string;
  initialValues?: {
    name: string;
    address: string | null;
    is_active: boolean;
  };
};

export function BranchForm({ mode, branchId, initialValues }: BranchFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [address, setAddress] = useState(initialValues?.address ?? "");
  const [isActive, setIsActive] = useState(initialValues?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const input = { name, address: address || null, is_active: isActive };
    const result =
      mode === "create"
        ? await createBranch(input)
        : await updateBranch(branchId!, input);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/branches");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <Input
        id="name"
        label="Branch name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        id="address"
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-slate-300"
        />
        Active
      </label>

      {error && (
        <p className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : mode === "create" ? "Create branch" : "Save changes"}
      </Button>
    </form>
  );
}
