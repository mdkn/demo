import { useEffect, useRef } from 'react';
import { COLORS } from '../../constants/colors';
import styles from './ColorPicker.module.scss';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

export function ColorPicker({ currentColor, onColorChange, onClose }: ColorPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    // Add delay to prevent immediate close from the same click that opened it
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    onClose();
  };

  return (
    <div className={styles.colorPicker} ref={pickerRef}>
      <div className={styles.colorGrid}>
        {COLORS.map(({ name, hex }) => (
          <button
            key={hex}
            className={`${styles.colorSwatch} ${currentColor === hex ? styles.selected : ''}`}
            style={{ backgroundColor: hex }}
            onClick={() => handleColorSelect(hex)}
            title={name}
            aria-label={`Select ${name} color`}
          />
        ))}
      </div>
    </div>
  );
}
