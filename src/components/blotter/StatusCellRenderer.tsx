'use client';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default function StatusCellRenderer(props: CustomCellRendererProps) {
  const status = props.value as string;

  const styles: Record<string, string> = {
    FILLED: 'bg-[#00C48C]/15 text-[#00C48C] border-[#00C48C]/30',
    PENDING: 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30',
    REJECTED: 'bg-[#FF4757]/15 text-[#FF4757] border-[#FF4757]/30',
    CANCELLED: 'bg-[#22232D] text-[#555662] border-[#363740]',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
}
