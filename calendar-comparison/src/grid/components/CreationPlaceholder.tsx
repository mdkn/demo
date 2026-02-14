import { useEffect, useRef } from 'react';
import styles from './CreationPlaceholder.module.css';

type CreationPlaceholderProps = {
  startMinutes: number;
  endMinutes: number;
  title: string;
  onTitleChange: (title: string) => void;
  onConfirm: (title: string) => void;
  onCancel: () => void;
};

export const CreationPlaceholder = ({
  startMinutes,
  endMinutes,
  title,
  onTitleChange,
  onConfirm,
  onCancel,
}: CreationPlaceholderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when placeholder appears
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onConfirm(title);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  // Grid positioning: rows are 1-indexed, minutes are 0-indexed
  const style: React.CSSProperties = {
    gridRow: `${startMinutes + 1} / ${endMinutes + 1}`,
    gridColumn: '1 / -1', // Span all columns
  };

  return (
    <div className={styles.creationPlaceholder} style={style}>
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="イベント名"
      />
    </div>
  );
};
