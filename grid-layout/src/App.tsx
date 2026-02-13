import { useMemos } from './hooks/useMemos';
import { Header } from './components/Header/Header';
import { MemoGrid } from './components/MemoGrid/MemoGrid';
import styles from './App.module.scss';

function App() {
  const {
    memos,
    layout,
    addMemo,
    updateMemo,
    deleteMemo,
    updateMemoColor,
    updateLayout,
    resetAll,
  } = useMemos();

  return (
    <div className={styles.app}>
      <Header onReset={resetAll} />
      <MemoGrid
        memos={memos}
        layout={layout}
        onLayoutChange={updateLayout}
        onAddMemo={addMemo}
        onUpdateMemo={updateMemo}
        onDeleteMemo={deleteMemo}
        onUpdateMemoColor={updateMemoColor}
      />
    </div>
  );
}

export default App;
