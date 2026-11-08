import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeddingCard } from '../types';
import { getGuestNameInlineStyle } from '../utils/guestFont';

interface CardLightboxProps {
  cards: WeddingCard[];
  initialIndex: number;
  guestName?: string;
  guestScale?: number;
  onClose: () => void;
}

export default function CardLightbox({ cards, initialIndex, guestName, guestScale = 1.0, onClose }: CardLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(2.5, s + 0.3));
  const handleZoomOut = () => setScale((s) => Math.max(1, s - 0.3));
  const handleResetZoom = () => setScale(1);

  const prevCard = () => {
    setScale(1);
    setCurrentIndex((idx) => (idx > 0 ? idx - 1 : cards.length - 1));
  };

  const nextCard = () => {
    setScale(1);
    setCurrentIndex((idx) => (idx < cards.length - 1 ? idx + 1 : 0));
  };

  const currentCard = cards[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fade-in"
      onClick={handleResetZoom}
    >
      {/* Top Header / Bar */}
      <div 
        className="flex items-center justify-between text-white z-10 px-2 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="text-sm font-['Cinzel'] font-bold text-neutral-200">
            {currentCard.title}
          </span>
        </div>

        {/* Zoom & Close Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            aria-label="Zoom out"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-40 flex items-center justify-center text-white transition-all"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 2.5}
            aria-label="Zoom in"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-40 flex items-center justify-center text-white transition-all"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={onClose}
            aria-label="Close fullscreen"
            className="w-10 h-10 rounded-full bg-[#8c122e] hover:bg-[#a61738] active:scale-95 flex items-center justify-center text-[#ffeaa7] shadow-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image Display Area */}
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden my-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="transition-transform duration-300 ease-out max-h-full flex items-center justify-center cursor-zoom-in relative"
          style={{ transform: `scale(${scale})` }}
          onClick={() => setScale((s) => (s > 1 ? 1 : 1.6))}
        >
          <div className="relative inline-block">
            <img
              src={currentIndex === 0 && guestName ? '/assets/aistudio/card1_clean.png' : currentCard.src}
              alt={currentCard.alt}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = currentCard.src;
                }
              }}
              className="max-h-[82vh] max-w-[95vw] sm:max-w-md w-auto h-auto object-contain rounded-md shadow-2xl crisp-card-img border border-[#d4af37]/30"
            />

            {/* Personalised name on Card 1 in lightbox (Centered, custom size & layout) */}
            {currentIndex === 0 && guestName && (() => {
              const style = getGuestNameInlineStyle(guestName, guestScale);
              return (
                <div 
                  className="absolute z-20 pointer-events-none flex flex-col items-center justify-center text-center px-2"
                  style={{
                    left: '20%',
                    right: '20%',
                    top: '55.6%',
                    height: '9.9%',
                  }}
                >
                  <span 
                    className="font-bold italic text-[#580517] tracking-tight whitespace-pre-line drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
                    style={{ 
                      fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                      fontSize: style.fontSize,
                      lineHeight: style.lineHeight,
                    }}
                  >
                    {guestName}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Prev / Next Nav Arrows on Screen */}
        <button
          onClick={(e) => { e.stopPropagation(); prevCard(); }}
          aria-label="Previous card"
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 border border-[#d4af37]/40 text-[#ffd700] flex items-center justify-center backdrop-blur-sm active:scale-90 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); nextCard(); }}
          aria-label="Next card"
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 border border-[#d4af37]/40 text-[#ffd700] flex items-center justify-center backdrop-blur-sm active:scale-90 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom helper info */}
      <div 
        className="text-center text-xs text-neutral-400 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        <span>Double-tap or pinch to zoom in on names, dates & addresses</span>
      </div>
    </div>
  );
}
