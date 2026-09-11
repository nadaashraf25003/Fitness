import React, { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  isLoading = false,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border-subtle bg-surface">
      <table className="w-full text-left text-sm text-text-main border-collapse">
        <thead className="bg-surface-card text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-subtle">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-5 py-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className="hover:bg-surface-elevated/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-4 whitespace-nowrap ${col.className || ''}`}>
                    {col.render ? col.render(item, index) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
