export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export type StatusType = 'completed' | 'delivered' | 'processing' | 'shipping' | 'cancelled' | 'pending' | 'verified'
  | 'active' | 'inactive' | 'expired' | 'open' | 'in_progress' | 'replied' | 'closed'
  | 'vip' | 'banned';

export interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export interface ProductCardProps {
  product: any;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}
