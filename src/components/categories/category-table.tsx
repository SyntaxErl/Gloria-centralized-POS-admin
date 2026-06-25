import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/table";
import { ArchiveCategoryButton } from "@/components/categories/archive-category-button";

type Category = {
  id: string;
  name: string;
  is_active: boolean;
};

export function CategoryTable({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return <p className="text-sm text-slate-500">No active categories.</p>;
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
              <Badge variant="success">Active</Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/categories/${category.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Edit
                </Link>
                <ArchiveCategoryButton categoryId={category.id} categoryName={category.name} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}