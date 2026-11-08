import { Calendar, MapPin, Heart, Link2 } from 'lucide-react';

interface BottomToolbarProps {
  onOpenCalendar: () => void;
  onOpenVenues: () => void;
  onOpenGuestbook: () => void;
  onOpenGenerator: () => void;
  onShare?: () => void;
}

export default function BottomToolbar({
  onOpenCalendar,
  onOpenVenues,
  onOpenGuestbook,
  onOpenGenerator,
}: BottomToolbarProps) {
  return (
    <nav 
      aria-label="Wedding Actions"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a0209]/95 backdrop-blur-lg border-t border-[#d4af37]/30 px-3 py-1.5 shadow-[0_-8px_20px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-sm sm:max-w-md mx-auto grid grid-cols-4 items-center gap-1">
        {/* 1. Dates */}
        <button
          onClick={onOpenCalendar}
          aria-label="Save Dates to Calendar"
          className="flex flex-col items-center justify-center py-1 text-center group active:scale-90 transition-transform cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-white/5 text-[#ffd700] group-hover:bg-[#8c122e] flex items-center justify-center border border-[#d4af37]/20 transition-colors shadow-sm">
            <Calendar size={17} />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5 text-neutral-300">
            Dates
          </span>
        </button>

        {/* 2. Venues */}
        <button
          onClick={onOpenVenues}
          aria-label="View Venues & Directions"
          className="flex flex-col items-center justify-center py-1 text-center group active:scale-90 transition-transform cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-white/5 text-[#ffd700] group-hover:bg-[#8c122e] flex items-center justify-center border border-[#d4af37]/20 transition-colors shadow-sm">
            <MapPin size={17} />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5 text-neutral-300">
            Venues
          </span>
        </button>

        {/* 3. Wishes */}
        <button
          onClick={onOpenGuestbook}
          aria-label="Send Wishes & Mubarak"
          className="flex flex-col items-center justify-center py-1 text-center group active:scale-90 transition-transform cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-white/5 text-rose-400 group-hover:bg-[#8c122e] flex items-center justify-center border border-[#d4af37]/20 transition-colors shadow-sm">
            <Heart size={17} />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5 text-neutral-300">
            Wishes
          </span>
        </button>

        {/* 4. Guest Links */}
        <button
          onClick={onOpenGenerator}
          aria-label="Guest Links Generator"
          className="flex flex-col items-center justify-center py-1 text-center group active:scale-90 transition-transform cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-white/5 text-[#ffd700] group-hover:bg-[#8c122e] flex items-center justify-center border border-[#d4af37]/20 transition-colors shadow-sm">
            <Link2 size={17} />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5 text-neutral-300">
            Guest Links
          </span>
        </button>
      </div>
    </nav>
  );
}
