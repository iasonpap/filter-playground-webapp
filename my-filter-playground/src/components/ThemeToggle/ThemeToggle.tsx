import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  return (
    <button 
      className={styles.themeToggle} 
      data-theme={theme}
      onClick={onToggle}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
