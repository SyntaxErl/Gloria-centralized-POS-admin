import { BranchForm } from "@/components/branches/branch-form";

export default function NewBranchPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Add branch</h1>
      <div className="mt-6">
        <BranchForm mode="create" />
      </div>
    </div>
  );
}
