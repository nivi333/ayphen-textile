import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className = '' }: ThemeToggleProps) => {
  const { theme, toggle } = useTheme();

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Fallback for browsers that don't support View Transitions
    if (!document.startViewTransition) {
      toggle();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      const root = document.documentElement;
      const nextTheme = theme === 'light' ? 'dark' : 'light';

      root.setAttribute('data-theme', nextTheme);
      if (nextTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      toggle();
    });

    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

      document.documentElement.animate(
        {
          clipPath: theme === 'dark' ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement:
            theme === 'dark' ? '::view-transition-old(root)' : '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={handleToggle}
      className={className}
      aria-label='Toggle theme'
    >
      {theme === 'dark' ? <Moon className='h-5 w-5' /> : <Sun className='h-5 w-5' />}
    </Button>
  );
};
