import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  id: number;
}

@Injectable({ providedIn: 'root' })
export class InteractionService {
  private toastId = 0;
  toasts = signal<ToastMessage[]>([]);

  showToast(severity: ToastMessage['severity'], summary: string, detail: string) {
    const id = ++this.toastId;
    this.toasts.update(t => [...t, { severity, summary, detail, id }]);
    setTimeout(() => this.toasts.update(t => t.filter(x => x.id !== id)), 4000);
  }

  success(msg: string) { this.showToast('success', 'Success', msg); }
  info(msg: string) { this.showToast('info', 'Info', msg); }
  warn(msg: string) { this.showToast('warn', 'Warning', msg); }
  error(msg: string) { this.showToast('error', 'Error', msg); }

  /** Generic search filter for any array of objects */
  filterData<T>(data: T[], searchTerm: string, searchFields: (keyof T)[], filters?: Record<string, any>): T[] {
    let result = [...data];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const val = (item as any)[field];
          return val && String(val).toLowerCase().includes(term);
        })
      );
    }
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          result = result.filter(item => (item as any)[key] === value);
        }
      });
    }
    return result;
  }

  /** Paginate array */
  paginate<T>(data: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }

  totalPages(totalItems: number, pageSize: number): number {
    return Math.ceil(totalItems / pageSize) || 1;
  }

  /** Sort data */
  sortData<T>(data: T[], field: string, direction: 'asc' | 'desc'): T[] {
    return [...data].sort((a: any, b: any) => {
      const va = a[field], vb = b[field];
      if (va < vb) return direction === 'asc' ? -1 : 1;
      if (va > vb) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /** Export to CSV */
  exportCSV(data: any[], filename: string, columns: string[]) {
    const header = columns.join(',');
    const rows = data.map(item => columns.map(c => JSON.stringify(item[c] ?? '')).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
    this.success(`Exported ${data.length} records to ${filename}.csv`);
  }
}
