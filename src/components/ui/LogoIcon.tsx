import { cn } from '@/utils/cn';

interface LogoIconProps {
  /** Size of the outer container: sm (w-10), md (w-14), lg (w-20) */
  size?: 'sm' | 'md' | 'lg';
  /** Override container className (bg, shadow, etc.) */
  containerClassName?: string;
  /** Override img className */
  className?: string;
  /** If true, render only the raw <img> without the wrapper */
  raw?: boolean;
}

const sizeMap = {
  sm: { container: 'w-10 h-10 rounded-2xl', icon: 'w-6 h-6' },
  md: { container: 'w-14 h-14 rounded-2xl', icon: 'w-8 h-8' },
  lg: { container: 'w-20 h-20 rounded-[1.5rem]', icon: 'w-10 h-10' },
};

export default function LogoIcon({
  size = 'sm',
  containerClassName,
  className,
  raw = false,
}: LogoIconProps) {
  const s = sizeMap[size];

  if (raw) {
    return <img src="/logo.svg" alt="Htech Logo" className={cn(s.icon, className)} />;
  }

  return (
    <div
      className={cn(
        s.container,
        'bg-[#6338f0] flex items-center justify-center shrink-0 shadow-blue-500/30',
        containerClassName
      )}
    >
      <img src="/logo.svg" alt="Htech Logo" className={cn(s.icon, className)} />
    </div>
  );
}
