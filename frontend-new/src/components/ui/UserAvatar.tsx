import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

export const UserAvatar = ({
  firstName,
  lastName,
  imageUrl,
  size = 36,
  className = '',
}: UserAvatarProps) => {
  const getInitials = () => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`.trim();
  };

  const initials = getInitials();
  const sizeClass = size === 38 ? 'h-10 w-10' : 'h-9 w-9';

  return (
    <Avatar className={`${sizeClass} ${className}`}>
      {imageUrl && <AvatarImage src={imageUrl} alt={`${firstName} ${lastName}`} />}
      <AvatarFallback className='bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold'>
        {initials || <User className='h-4 w-4' />}
      </AvatarFallback>
    </Avatar>
  );
};
