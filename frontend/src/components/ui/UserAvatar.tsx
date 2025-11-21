import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './UserAvatar.scss';

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName,
  lastName,
  imageUrl,
  size = 36,
}) => {
  const getInitials = () => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`.trim();
  };

  const initials = getInitials();

  if (imageUrl) {
    return <Avatar size={size} src={imageUrl} />;
  }

  if (initials) {
    return (
      <Avatar size={size} className='user-avatar-gradient'>
        {initials}
      </Avatar>
    );
  }

  return <Avatar size={size} icon={<UserOutlined />} className='user-avatar-gradient' />;
};
