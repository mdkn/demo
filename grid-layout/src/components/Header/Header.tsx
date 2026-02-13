import styles from './Header.module.scss';

interface HeaderProps {
  onReset: () => void;
}

export const Header = ({ onReset }: HeaderProps) => {
  const handleReset = () => {
    if (window.confirm('Clear all memos? This action cannot be undone.')) {
      onReset();
    }
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Grid Memo</h1>
      <button className={styles.resetButton} onClick={handleReset}>
        Reset
      </button>
    </header>
  );
}
