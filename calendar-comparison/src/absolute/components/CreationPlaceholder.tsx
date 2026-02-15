import { useEffect, useRef } from 'react';
import styles from './CreationPlaceholder.module.css';

type CreationPlaceholderProps = {
  startMinutes: number;
  endMinutes: number;
  hourHeight: number;
  title: string;
  onTitleChange: (title: string) => void;
  onConfirm: (title: string) => void;
  onCancel: () => void;
};

export const CreationPlaceholder = ({
  startMinutes,
  endMinutes,
  hourHeight,
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

  const topPx = (startMinutes / 60) * hourHeight;
  const heightPx = ((endMinutes - startMinutes) / 60) * hourHeight;

  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${topPx}px`,
    height: `${heightPx}px`,
    width: '100%',
    left: 0,
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
