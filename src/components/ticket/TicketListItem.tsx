import { memo } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '@/components';
import { formatDateShort as formatDate } from '@/utils/format';
import type { TicketResponse } from '@/types';

interface TicketListItemProps {
  ticket: TicketResponse;
  isSelected: boolean;
  onClick: (ticket: TicketResponse) => void;
  showUserName?: boolean;
}

function TicketListItemRaw({ ticket, isSelected, onClick, showUserName }: TicketListItemProps) {
  const { t } = useTranslation('common');
  return (
    <button
      onClick={() => onClick(ticket)}
      className={`w-full p-4 rounded-xl text-left transition-all ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 shadow-sm'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-md truncate">{ticket.subject}</p>
          <p className="text-sm text-muted mt-1">
            {showUserName && ticket.userName ? <span className="font-medium text-body">{ticket.userName} • </span> : ''}
            {ticket.ticketNumber} • {formatDate(ticket.createdAt)}
          </p>
          <p className="text-sm text-subtle mt-1">
            {t('labels.messagesCount', { count: ticket.messages?.length || 0 })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={ticket.status} className="text-10" />
          <FiChevronRight className="text-subtle" />
        </div>
      </div>
    </button>
  );
}

const TicketListItem = memo(TicketListItemRaw, (prev, next) => {
  return (
    prev.ticket.id === next.ticket.id &&
    prev.ticket.status === next.ticket.status &&
    prev.ticket.subject === next.ticket.subject &&
    prev.ticket.messages?.length === next.ticket.messages?.length &&
    prev.isSelected === next.isSelected
  );
});

export default TicketListItem;
