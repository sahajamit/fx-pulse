'use client';

import { RfqStatus } from '@/lib/types';

const STATUS_STYLES: Record<RfqStatus, string> = {
  IDLE: 'bg-[#22232D] text-[#555662] border-[#363740]',
  PENDING: 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30 animate-pulse',
  QUOTED: 'bg-[#2962FF]/15 text-[#5C85FF] border-[#2962FF]/30',
  ACCEPTED: 'bg-[#00C48C]/15 text-[#00C48C] border-[#00C48C]/30',
  REJECTED: 'bg-[#FF4757]/15 text-[#FF4757] border-[#FF4757]/30',
  EXPIRED: 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30',
};

export default function RfqStatusBadge({ status }: { status: RfqStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${STATUS_STYLES[status]}`}
      data-testid="rfq-status"
    >
      {status}
    </span>
  );
}
