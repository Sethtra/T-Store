import Skeleton from "../ui/Skeleton";
import Card from "../ui/Card";

export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton variant="text" width={i === 0 ? "70%" : "40%"} className="mb-2" />
        {i === 0 && <Skeleton variant="text" width="40%" height="12px" />}
      </td>
    ))}
  </tr>
);

export const StatsCardSkeleton = () => (
  <Card className="h-full border border-[var(--color-border)] shadow-sm bg-[var(--color-bg-elevated)]">
    <Card.Body className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="circle" width="32px" height="32px" />
        <Skeleton variant="text" width="60px" height="12px" />
      </div>
      <div>
        <Skeleton variant="text" width="50%" height="32px" className="mb-2" />
        <Skeleton variant="text" width="80%" height="12px" />
      </div>
    </Card.Body>
  </Card>
);

export const TableSkeleton = ({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) => (
  <tbody className="divide-y divide-[var(--color-border)]">
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} columns={columns} />
    ))}
  </tbody>
);
