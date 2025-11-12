import { Switch } from 'antd';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeSwitch({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <div className={className}>
      <Switch
        checked={theme === 'dark'}
        onChange={toggle}
        checkedChildren="Dark"
        unCheckedChildren="Light"
      />
    </div>
  );
}
