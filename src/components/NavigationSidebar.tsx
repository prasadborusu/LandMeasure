import { Ruler, Download, HelpCircle, RotateCcw, Undo2, Redo2 } from 'lucide-react';

interface NavigationSidebarProps {
  activeTab: 'measure' | 'export' | 'help';
  hasPoints: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onSelectTab: (tab: 'measure' | 'export' | 'help') => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onOpenHelp: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  hasPoints,
  canUndo,
  canRedo,
  onSelectTab,
  onUndo,
  onRedo,
  onClear,
  onOpenHelp,
}) => {
  return (
    <nav className="hidden md:flex flex-col w-20 bg-white border-r border-gray-200 py-4 items-center justify-between shrink-0 select-none z-20">
      {/* Top navigation items */}
      <div className="flex flex-col items-center space-y-4 w-full">
        {/* Measure Tab */}
        <button
          onClick={() => onSelectTab('measure')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition ${
            activeTab === 'measure'
              ? 'bg-emerald-50 text-emerald-700 font-bold shadow-2xs border border-emerald-200/60'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Active Measurement"
        >
          <Ruler className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Measure</span>
        </button>

        {/* Export Tab */}
        <button
          onClick={() => onSelectTab('export')}
          disabled={!hasPoints}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition disabled:opacity-30 disabled:hover:bg-transparent ${
            activeTab === 'export'
              ? 'bg-emerald-50 text-emerald-700 font-bold shadow-2xs border border-emerald-200/60'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Export Options"
        >
          <Download className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Export</span>
        </button>

        {/* Help / Accuracy Info */}
        <button
          onClick={onOpenHelp}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
          title="How it Works & Algorithm Details"
        >
          <HelpCircle className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Help</span>
        </button>
      </div>

      {/* Bottom utility items */}
      <div className="flex flex-col items-center space-y-2 w-full pt-4 border-t border-gray-100">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center transition"
          title="Undo point"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center transition"
          title="Redo point"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onClear}
          disabled={!hasPoints}
          className="w-10 h-10 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 flex items-center justify-center transition"
          title="Clear measurement"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
