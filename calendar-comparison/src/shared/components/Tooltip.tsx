type TooltipProps = {
  visible: boolean;
  x: number;
  y: number;
  content: string;
};

export const Tooltip = ({ visible, x, y, content }: TooltipProps) => {
  if (!visible) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${x + 10}px`,  // Offset 10px from cursor to avoid hiding
    top: `${y + 10}px`,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    pointerEvents: 'none',  // Don't interfere with mouse events
    zIndex: 10000,
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  };

  return <div style={style}>{content}</div>;
};
