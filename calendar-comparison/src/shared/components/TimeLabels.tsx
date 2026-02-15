import { generateTimeSlots } from '@shared/utils/dateUtils';
import styles from './TimeLabels.module.css';

export const TimeLabels = () => {
  const timeSlots = generateTimeSlots();

  return (
    <div className={styles.timeLabels}>
      {timeSlots.map((slot) => (
        <div
          key={slot.hour}
          className={styles.timeLabel}
          style={{ top: slot.topPosition }}
        >
          {slot.label}
        </div>
      ))}
    </div>
  );
};
