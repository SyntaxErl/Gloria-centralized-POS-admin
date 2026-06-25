import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RestoreBranchButton } from "@/components/branches/restore-branch-button";
import { DeleteBranchButton } from "@/components/branches/delete-branch-button";

type Branch = {
  id: string;
  name: string;
  address: string | null;
  is_active: boolean;
};

export function BranchArchiveTable({ branches }: { branches: Branch[] }) {
  if (branches.length === 0) {
    return <p className="text-sm text-slate-500">No archived branches.</p>;
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell className="hidden sm:table-cell">
            Address
          </TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {branches.map((branch) => (
          <TableRow key={branch.id}>
            <TableCell>{branch.name}</TableCell>
            <TableCell className="hidden sm:table-cell">
              {branch.address ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant="neutral">Archived</Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap items-center gap-2">
                <RestoreBranchButton branchId={branch.id} />
                <DeleteBranchButton branchId={branch.id} branchName={branch.name} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}