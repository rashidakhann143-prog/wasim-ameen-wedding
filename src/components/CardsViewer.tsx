import { useRef } from 'react';
import { Maximize2, ChevronDown, Link2 } from 'lucide-react';
import { WeddingCard } from '../types';
import { getGuestNameInlineStyle } from '../utils/guestFont';

interface CardsViewerProps {
  cards: WeddingCard[];
  activeCardIndex: number;
  guestName?: string;
  guestScale?: number;
  onSelectCardForZoom: (index: number) => void;
  onScrollToCard: (index: number) => void;
  onOpenCalendar: () => void;
  onOpenVenues: () => void;
  onOpenGuestbook: () => void;
  onOpenGenerator: () => void;
  onReopenEnvelope: () => void;
}

export default function CardsViewer({
  cards,
  activeCardIndex,
  guestName,
  guestScale = 1.0,
  onSelectCardForZoom,
  onScrollToCard,
  onOpenCalendar,
  onOpenVenues,
  onOpenGuestbook,
  onOpenGenerator,
  onReopenEnvelope,
}: CardsViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[100dvh] bg-[#160207] text-[#faedd0] ios-scroll-container overflow-y-auto"
    >
      {/* Background Islamic Geometric / Floral Motifs */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #d4af37 1px, transparent 1px), radial-gradient(circle at 0% 0%, #d4af37 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating Top Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#20020a]/90 backdrop-blur-md border-b border-[#d4af37]/25 px-4 py-2.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <span className="font-['Cinzel'] font-bold text-base sm:text-lg tracking-wider text-[#faedd0]">
            Wasim & Ameen
          </span>
          <span className="hidden sm:inline-block text-[11px] text-[#d4af37]/80 font-serif italic">
            · 18th November 2026
          </span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenGenerator}
            title="Guest Name Generator"
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#58071c] hover:bg-[#720a24] text-[#ffd700] border border-[#d4af37]/40 flex items-center gap-1 transition-all"
          >
            <Link2 size={13} />
            <span className="hidden xs:inline">Links</span>
          </button>

          {/* Card Quick-Jump Tabs (Segmented control) */}
          <div className="flex items-center gap-0.5 bg-[#340411] p-1 rounded-lg border border-[#d4af37]/25">
            {cards.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => onScrollToCard(idx)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeCardIndex === idx
                    ? 'bg-gradient-to-r from-[#941935] to-[#b32042] text-[#ffd700] shadow-sm border border-[#d4af37]/40'
                    : 'text-[#faedd0]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                C{idx + 1}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Intro Welcome Banner */}
      <div className="relative z-10 pt-6 pb-4 px-4 text-center max-w-lg mx-auto">
        <p className="font-serif italic text-sm text-[#e6ca85] tracking-widest uppercase">
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </p>
        <h2 className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-[#ffd700] mt-1 tracking-wide">
          Royal Wedding Invitation
        </h2>

        {guestName ? (
          <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3a0614] border border-[#d4af37]/50 shadow-md">
            <span className="text-[11px] uppercase tracking-wider text-[#d4af37]">Personalised for:</span>
            <span className="text-xs font-bold font-serif text-[#ffd700]">{guestName}</span>
          </div>
        ) : (
          <p className="text-xs text-[#faedd0]/80 mt-1 max-w-xs mx-auto">
            Scroll down to explore all 4 original invitation cards
          </p>
        )}
        <div className="flex justify-center mt-2 text-[#d4af37]/70 animate-bounce">
          <ChevronDown size={18} />
        </div>
      </div>

      {/* Main Cards Stack (Vertical Scroll through all 4 cards) */}
      <main className="relative z-10 max-w-xl mx-auto px-3 sm:px-6 space-y-10 pb-36">
        {cards.map((card, index) => (
          <section
            key={card.id}
            id={`card-${index}`}
            className="group relative scroll-mt-20 flex flex-col items-center"
          >
            {/* Card Editorial Header */}
            <div className="w-full flex items-center justify-between px-2 mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-['Cinzel'] font-bold text-[#ffd700] text-sm tracking-wider">
                  0{index + 1}. {card.title}
                </span>
              </div>
              <span className="text-[11px] text-[#e6ca85]/80 font-serif italic">
                {card.subtitle}
              </span>
            </div>

            {/* The Unmodified Original Card Image Container */}
            <div className="relative w-full rounded-lg overflow-hidden bg-[#24030c] border border-[#d4af37]/40 shadow-2xl transition-all duration-300 group-hover:border-[#d4af37]/80">
              
              {/* Outer gold border accent */}
              <div className="absolute inset-1 rounded-md border border-[#d4af37]/20 pointer-events-none z-10" />

              {/* Exact Unmodified Card Image (or clean version when personalized with guest name) */}
              <img
                src={index === 0 && guestName ? '/assets/aistudio/card1_clean.png' : card.src}
                alt={card.alt}
                loading={index < 2 ? 'eager' : 'lazy'}
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    // Fallback to original card image if clean fails
                    target.src = card.src;
                  }
                }}
                className="w-full h-auto block object-contain crisp-card-img select-none"
              />

              {/* Personalised Guest Name Overlay on Card 1 below To, (Centered, custom size & layout) */}
              {index === 0 && guestName && (() => {
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

              {/* Tap to Zoom Float Button */}
              <button
                onClick={() => onSelectCardForZoom(index)}
                aria-label={`Zoom Card ${index + 1}`}
                className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 text-[#ffeaa7] border border-[#d4af37]/50 backdrop-blur-sm text-xs font-medium shadow-lg active:scale-95 transition-all"
              >
                <Maximize2 size={13} className="text-[#ffd700]" />
                <span>Tap to Zoom</span>
              </button>
            </div>

            {/* Subtle card bottom caption */}
            <div className="mt-2 text-center">
              <span className="text-[11px] text-[#faedd0]/60 font-serif italic">
                Card {index + 1} of {cards.length} · Original Invitation Card
              </span>
            </div>
          </section>
        ))}

        {/* Celebration Summary & Quick Actions Card at the End of Scroll */}
        <section className="mt-12 p-6 rounded-2xl bg-gradient-to-b from-[#380512] to-[#22020a] border-2 border-[#d4af37]/40 shadow-2xl text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#8c122e] flex items-center justify-center text-[#ffd700] border border-[#d4af37]/40 mb-3">
            <span className="font-['Cinzel'] font-bold text-lg">W&A</span>
          </div>
          <h3 className="font-['Cinzel'] text-xl font-bold text-[#faedd0]">
            With Best Compliments
          </h3>
          <p className="font-serif italic text-sm text-[#ffd700] mt-1">
            ALL RELATIVES & FAMILY
          </p>
          <p className="text-xs text-[#faedd0]/80 mt-2 max-w-sm mx-auto leading-relaxed">
            Mrs. Kamrunnisha & Late Mr. Fakir Mohammed Sb.<br />
            2, Cement Gali, Dholi Bawari, Udaipur (Raj.)
          </p>

          <div className="grid grid-cols-2 gap-2.5 mt-6 max-w-md mx-auto">
            <button
              onClick={onOpenCalendar}
              className="py-2.5 px-3 rounded-xl bg-[#5c081d] hover:bg-[#720a24] text-[#faedd0] border border-[#d4af37]/40 text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              Save Dates
            </button>
            <button
              onClick={onOpenVenues}
              className="py-2.5 px-3 rounded-xl bg-[#8c122e] hover:bg-[#a61738] text-[#faedd0] border border-[#d4af37]/40 text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              Directions
            </button>
            <button
              onClick={onOpenGuestbook}
              className="py-2.5 px-3 rounded-xl bg-[#450514] hover:bg-[#5a071a] text-[#faedd0] border border-[#d4af37]/30 text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              Send Mubarak
            </button>
            <button
              onClick={onReopenEnvelope}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#941935] to-[#b32042] text-[#ffd700] border border-[#d4af37]/50 text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              Replay Envelope
            </button>
            <button
              onClick={onOpenGenerator}
              className="col-span-2 py-3 px-3 rounded-xl bg-gradient-to-r from-[#8c122e] via-[#ab193d] to-[#8c122e] text-[#ffd700] border-2 border-[#d4af37]/70 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:brightness-110"
            >
              <Link2 size={15} />
              <span>Guest Link Generator (50+ Guests)</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
