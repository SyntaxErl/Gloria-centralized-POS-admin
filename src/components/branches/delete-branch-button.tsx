"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deleteBranch } from "@/lib/queries/branches";

/**
 * Hard delete — meant to only be reachable from the archived branches
 * view, one step removed from the active list. Uses the Modal primitive
 * instead of window.confirm() so the warning can actually explain the
 * consequence, not just a generic browser "Are you sure?".
 */
export function DeleteBranchButton({
  branchId,
  branchName,
}: {
  branchId: string;
  branchName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setLoading(true);
    setError(null);
    const result = await deleteBranch(branchId);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete permanently
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Delete this branch?">
        <p className="text-sm text-slate-600">
          You're about to permanently delete <strong>{branchName}</strong>.
          This cannot be undone — all data tied to this branch will be gone,
          not just the branch record.
        </p>

        {error && (
          <p className="mt-3 rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={loading}>
            {loading ? "Deleting..." : "Yes, delete permanently"}
          </Button>
        </div>
      </Modal>
    </>
  );
}