/**
 * Sidebar Component
 * Collapsible navigation sidebar with menu items
 */

import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className='h-5 w-5' />, path: '/dashboard' },
  { label: 'Products', icon: <Package className='h-5 w-5' />, path: '/products' },
  { label: 'Customers', icon: <Users className='h-5 w-5' />, path: '/customers' },
  { label: 'Orders', icon: <ShoppingCart className='h-5 w-5' />, path: '/orders' },
  { label: 'Reports', icon: <FileText className='h-5 w-5' />, path: '/reports' },
  { label: 'Settings', icon: <Settings className='h-5 w-5' />, path: '/settings' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className='absolute -right-3 top-9 z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-card shadow-md hover:bg-accent'
      >
        {collapsed ? <ChevronRight className='h-4 w-4' /> : <ChevronLeft className='h-4 w-4' />}
      </button>

      {/* Navigation Items */}
      <nav className='flex-1 space-y-1 p-2 pt-4'>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
