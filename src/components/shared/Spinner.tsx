interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const SIZE: Record<string, string> = {
  sm: 'w-3 h-3 border-[1.5px]',
  md: 'w-4 h-4 border-2',
  lg: 'w-5 h-5 border-2',
};

export function Spinner({ size = 'sm', className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full border-current border-t-transparent animate-spin ${SIZE[size]} ${className}`}
    />
  );
}
