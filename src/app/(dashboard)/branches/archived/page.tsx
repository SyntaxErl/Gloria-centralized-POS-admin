import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BranchArchiveTable } from "@/components/branches/branch-archive-table";
import { Button } from "@/components/ui/button";

export default async function ArchivedBranchesPage() {
  const supabase = await createClient();
  const { data: branches, error } = await supabase
    .from("branches")
    .select("id, name, address, is_active")
    .eq("is_active", false)
    .order("name");

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Archived Branches
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Restore a branch to make it active again, or delete it permanently.
          </p>
        </div>
        <Link href="/branches">
          <Button variant="outline">Back to active branches</Button>
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          Failed to load archived branches: {error.message}
        </p>
      )}

      <div className="mt-6">
        <BranchArchiveTable branches={branches ?? []} />
      </div>
    </div>
  );
}