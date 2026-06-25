import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BranchForm } from "@/components/branches/branch-form";

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;

  const supabase = await createClient();
  const { data: branch } = await supabase
    .from("branches")
    .select("id, name, address, is_active")
    .eq("id", branchId)
    .single();

  if (!branch) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Edit branch</h1>
      <div className="mt-6">
        <BranchForm
          mode="edit"
          branchId={branch.id}
          initialValues={{
            name: branch.name,
            address: branch.address,
            is_active: branch.is_active,
          }}
        />
      </div>
    </div>
  );
}
