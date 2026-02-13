import { useState, useRef, useEffect } from 'react';
import type { Memo } from '../../types';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import styles from './MemoCard.module.scss';

interface MemoCardProps {
  memo: Memo;
  isEditing: boolean;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onColorChange: (color: string) => void;
  onEditModeChange: (editing: boolean) => void;
}

export const MemoCard = ({
  memo,
  isEditing,
  onUpdate,
  onDelete,
  onColorChange,
  onEditModeChange,
}: MemoCardProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [localContent, setLocalContent] = useState(memo.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Sync local content with prop changes
  useEffect(() => {
    setLocalContent(memo.content);
  }, [memo.content]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent creating new memo in parent grid
    e.stopPropagation();

    if (!isEditing) {
      onEditModeChange(true);
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      onUpdate(localContent);
      onEditModeChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onUpdate(localContent);
      onEditModeChange(false);
    }
  };

  const handleColorButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowColorPicker(!showColorPicker);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={styles.memoCard}
      style={{ backgroundColor: memo.color }}
      onDoubleClick={handleDoubleClick}
    >
      <button
        className={styles.deleteButton}
        onClick={handleDeleteClick}
        aria-label="Delete memo"
      >
        ×
      </button>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type your memo..."
        />
      ) : (
        <div ref={contentRef} className={styles.content}>
          {memo.content || 'Double-click to edit'}
        </div>
      )}

      <button
        className={styles.colorButton}
        onClick={handleColorButtonClick}
        aria-label="Change color"
      >
        🎨
      </button>

      {showColorPicker && (
        <ColorPicker
          currentColor={memo.color}
          onColorChange={onColorChange}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
}
