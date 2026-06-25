import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RestoreCategoryButton } from "@/components/categories/restore-category-button";

type Category = {
  id: string;
  name: string;
  is_active: boolean;
};

// No delete button here, deliberately — categories have no real DELETE
// permission at all in the RLS layer (003_rls_policies.sql), so unlike
// branches' archive view, restoring is the only action available.
export function CategoryArchiveTable({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return <p className="text-sm text-slate-500">No archived categories.</p>;
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>{category.name}</TableCell>
            <TableCell>
              <Badge variant="neutral">Archived</Badge>
            </TableCell>
            <TableCell>
              <RestoreCategoryButton categoryId={category.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}