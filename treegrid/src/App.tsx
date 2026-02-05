import { Treegrid } from './components/Treegrid';
import { fileTree } from './data';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">WAI-ARIA Treegrid File Browser</h1>
          <p className="text-gray-600 mb-6">
            Navigate using arrow keys, Enter to expand/collapse, and Tab to move focus.
          </p>
          <Treegrid data={fileTree} />
        </div>
      </div>
    </div>
  );
}

export default App;
