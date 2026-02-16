type ResizeHandleProps = {
  position: 'top' | 'bottom';
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
};

export const ResizeHandle = ({ position, onPointerDown }: ResizeHandleProps) => {
  return (
    <div
      className={`resize-handle resize-handle-${position}`}
      onPointerDown={onPointerDown}
      style={{
        position: 'absolute',
        width: '100%',
        height: '8px',
        [position]: 0,
        cursor: 'ns-resize',
        zIndex: 10,
      }}
    />
  );
};
