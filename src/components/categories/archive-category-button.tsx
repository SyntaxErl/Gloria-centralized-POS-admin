"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { archiveCategory } from "@/lib/queries/categories";

export function ArchiveCategoryButton({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmArchive() {
    setLoading(true);
    setError(null);
    const result = await archiveCategory(categoryId);
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
      <Button variant="outline" onClick={() => setOpen(true)}>
        Archive
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Archive this category?">
        <p className="text-sm text-slate-600">
          <strong>{categoryName}</strong> will be hidden from the active
          categories list and from product category pickers. Nothing is
          deleted — you can restore it anytime from the archived view.
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
          <Button variant="primary" onClick={handleConfirmArchive} disabled={loading}>
            {loading ? "Archiving..." : "Yes, archive"}
          </Button>
        </div>
      </Modal>
    </>
  );
}