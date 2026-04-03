import { cn } from '@/utils/cn';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface UserAvatarProps {
  name?: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_MAP: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

/**
 * Avatar component — hiển thị ảnh đại diện hoặc chữ cái đầu tên.
 * Thay thế cho pattern copy-paste avatar + initials fallback.
 */
export default function UserAvatar({ name, src, size = 'md', className }: UserAvatarProps) {
  const sizeClass = SIZE_MAP[size];
  const initial = name?.charAt(0)?.toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn('rounded-full object-cover', sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold',
        sizeClass,
        className,
      )}
    >
      {initial}
    </div>
  );
}
