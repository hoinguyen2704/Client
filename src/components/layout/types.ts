export interface HeaderProps {
  user: { role: string; email: string } | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onMenuToggle: () => void;
  onLogout: () => void;
}

export interface MobileMenuProps {
  isOpen: boolean;
  user: { role: string; email: string } | null;
  onClose: () => void;
  onLogout: () => void;
}

export interface AdminHeaderProps {
  onLogout: () => void;
}
