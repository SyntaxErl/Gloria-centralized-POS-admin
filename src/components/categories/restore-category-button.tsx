"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { restoreCategory } from "@/lib/queries/categories";

export function RestoreCategoryButton({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRestore() {
    setLoading(true);
    setError(null);
    const result = await restoreCategory(categoryId);
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