import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isCelebrationMusicActive, subscribeToMusicState, toggleBackgroundMusic } from '../utils/audio';

interface MusicToggleProps {
  /** Lift the button above the bottom toolbar when it is visible */
  raised?: boolean;
}

export default function MusicToggle({ raised = false }: MusicToggleProps) {
  const [isOn, setIsOn] = useState<boolean>(() => isCelebrationMusicActive());

  useEffect(() => subscribeToMusicState(setIsOn), []);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsOn(toggleBackgroundMusic());
      }}
      aria-label={isOn ? 'Turn music off' : 'Turn music on'}
      aria-pressed={isOn}
      title={`${isOn ? 'Music on' : 'Music off'} · "Heartwarming" by Kevin MacLeod (incompetech.com), CC BY 4.0`}
      className={`fixed right-3 z-[45] w-10 h-10 rounded-full bg-[#380514]/85 hover:bg-[#52071b] text-[#ffd700] border border-[#d4af37]/50 flex items-center justify-center backdrop-blur-sm shadow-lg active:scale-95 transition-all cursor-pointer ${
        raised ? 'bottom-[calc(5rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]'
      }`}
    >
      {isOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-80" />}
    </button>
  );
}
