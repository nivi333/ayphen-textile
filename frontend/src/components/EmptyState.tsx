import { Empty } from 'antd';
import { GradientButton } from './ui';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title = 'Nothing here',
  description = 'No data available',
  actionText,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center ${className}`}>
      <Empty description={false} />
      <div className='mt-2 text-base font-semibold'>{title}</div>
      {description && <div className='text-muted text-sm'>{description}</div>}
      {actionText && onAction && (
        <GradientButton size='small' className='mt-3' onClick={onAction}>
          {actionText}
        </GradientButton>
      )}
    </div>
  );
}
