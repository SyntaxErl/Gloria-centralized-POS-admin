"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { restoreBranch } from "@/lib/queries/branches";

export function RestoreBranchButton({ branchId }: { branchId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRestore() {
    setLoading(true);
    setError(null);
    const result = await restoreBranch(branchId);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleRestore} disabled={loading}>
        {loading ? "Restoring..." : "Restore"}
      </Button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}