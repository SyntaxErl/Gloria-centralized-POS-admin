import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BranchTable } from "@/components/branches/branch-table";
import { Button } from "@/components/ui/button";

export default async function BranchesPage() {
  const supabase = await createClient();
  const { data: branches, error } = await supabase
    .from("branches")
    .select("id, name, address, is_active")
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Branches</h1>
        <div className="flex gap-2">
          <Link href="/branches/archived">
            <Button variant="outline">Archived</Button>
          </Link>
          <Link href="/branches/new">
            <Button>Add branch</Button>
          </Link>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          Failed to load branches: {error.message}
        </p>
      )}

      <div className="mt-6">
        <BranchTable branches={branches ?? []} />
      </div>
    </div>
  );
}