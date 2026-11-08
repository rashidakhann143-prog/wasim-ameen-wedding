import { useState, useCallback } from 'react';
import { playEnvelopeOpenSound, startAmbientCelebrationMusic, resumeAudioContextIfNeeded } from '../utils/audio';
import { OWNER_EXPERIENCE_SETTINGS } from '../config/experienceSettings';
import { Link2 } from 'lucide-react';
import { getEnvelopeGuestNameInlineStyle } from '../utils/guestFont';

interface EnvelopeProps {
  firstCardSrc: string;
  guestName?: string;
  guestScale?: number;
  onOpenComplete: () => void;
  onOpenGenerator?: () => void;
}

export default function Envelope({ firstCardSrc, guestName, guestScale = 1.0, onOpenComplete, onOpenGenerator }: EnvelopeProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleOpen = useCallback(() => {
    if (isOpening || hasInteracted) return;
    setHasInteracted(true);
    setIsOpening(true);

    // Unlocks Web Audio API on iPhone Safari / mobile browsers directly from this user tap
    resumeAudioContextIfNeeded();

    // Play royal opening chime and paper rustle
    playEnvelopeOpenSound();

    // Automatically start background music on first tap if enabled by owner
    if (OWNER_EXPERIENCE_SETTINGS.ENABLE_BACKGROUND_MUSIC) {
      startAmbientCelebrationMusic();
    }

    // Trigger reveal sequence
    setTimeout(() => {
      onOpenComplete();
    }, 2700);
  }, [isOpening, hasInteracted, onOpenComplete]);

  return (
    <div className={`relative w-full min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 bg-radial from-[#380410] via-[#22020a] to-[#120105] overflow-hidden select-none ${isOpening ? 'fixed inset-0 z-[100] !p-0' : ''}`}>
      {/* Background Islamic Geometric / Floral Motifs */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #d4af37 1px, transparent 1px), radial-gradient(circle at 0% 0%, #d4af37 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#931535]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Right Quick Access for Guest Link Generator */}
      {onOpenGenerator && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenGenerator();
          }}
          className="absolute top-4 right-4 z-40 px-3 py-1.5 rounded-full bg-[#380514]/80 hover:bg-[#52071b] text-[#ffd700] border border-[#d4af37]/40 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm active:scale-95 transition-all shadow-md cursor-pointer"
          title="Open Guest Name Generator"
        >
          <Link2 size={13} />
          <span className="hidden sm:inline">Guest Links</span>
          <span className="sm:hidden">Links</span>
        </button>
      )}

      {/* Header Intro */}
      <div className={`relative z-10 text-center mb-6 max-w-sm px-4 animate-fade-in transition-opacity duration-300 ${isOpening ? 'opacity-0' : 'opacity-100'}`}>
        <p className="font-serif italic text-[#e6ca85] text-sm tracking-widest uppercase mb-1 drop-shadow-sm">
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </p>
        <h1 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold tracking-wider text-[#faedd0] drop-shadow-md">
          Wasim & Ameen
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]/80 mt-1 font-medium">
          Wedding Invitation · Nov 2026
        </p>

        {guestName && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#460617] border border-[#d4af37]/50 shadow-md">
            <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold">Special Invitation For:</span>
            <span className="text-xs font-bold font-serif text-[#ffd700]">{guestName}</span>
          </div>
        )}
      </div>

      {/* Interactive Envelope Container */}
      <div 
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        aria-label="Open wedding invitation envelope"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); }}
        className={`relative z-20 w-full max-w-[360px] sm:max-w-[420px] aspect-[4/3] cursor-pointer group focus:outline-none transition-all duration-1000 ease-in-out ${
          isOpening ? 'w-[min(92vw,460px)] !max-w-none !h-[min(84dvh,780px)] !aspect-auto scale-100' : 'hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {/* Envelope Outer Shadow & Glow */}
        <div className="absolute inset-0 rounded-xl bg-black/60 blur-xl transform translate-y-4" />
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-[#d4af37]/40 via-[#b38827]/20 to-[#60081d]/30 blur-sm group-hover:from-[#d4af37]/60 transition-all duration-300" />

        {/* Envelope Main Shell (Deep Burgundy Texture) */}
        <div className={`relative w-full h-full rounded-xl bg-gradient-to-b from-[#5c081d] via-[#480515] to-[#36020f] border-2 border-[#d4af37]/50 shadow-2xl overflow-hidden flex flex-col justify-end transition-all duration-700 ${isOpening ? 'border-transparent bg-transparent shadow-none' : ''}`}>
          
          {/* Subtle gold foil border insets */}
          <div className="absolute inset-2 border border-[#d4af37]/30 rounded-lg pointer-events-none" />
          <div className="absolute inset-3 border border-[#d4af37]/15 rounded-md pointer-events-none" />

          {/* Corner gold ornaments */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#d4af37]/80 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#d4af37]/80 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#d4af37]/80 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#d4af37]/80 rounded-br-sm pointer-events-none" />

          {/* Back Paper Cavity (Interior lining in rich crimson damask) */}
          <div className="absolute inset-0 bg-[#2b020a] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#4a0718_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          </div>

          {/* Emerging First Card Preview (Slides upwards during opening) */}
          <div 
            className={`absolute transition-all duration-1000 ease-out ${
              isOpening
                ? 'inset-0 z-50 flex items-center justify-center opacity-100 pointer-events-none'
                : 'left-4 right-4 bottom-2 translate-y-4 opacity-0 z-10 pointer-events-none'
            }`}
            style={isOpening ? { animation: 'weddingCardRise 1.65s cubic-bezier(0.2, 0.75, 0.25, 1) both' } : undefined}
          >
            <div className={`relative ${isOpening ? 'w-full h-full flex items-center justify-center bg-transparent p-0 border-0 shadow-none' : 'bg-[#fffdf9] p-1.5 rounded-sm shadow-2xl border border-[#d4af37]/40 max-w-[280px] mx-auto'}`}>
              <div className={isOpening ? "relative h-full w-full" : "relative"}>
                <img 
                  src={guestName ? '/assets/aistudio/card1_clean.png' : firstCardSrc} 
                  alt="Card 1 Preview" 
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = '1';
                      target.src = firstCardSrc;
                    }
                  }}
                  className={`crisp-card-img ${isOpening ? 'w-full h-full object-contain rounded-sm shadow-2xl' : 'w-full h-auto rounded-xs object-cover'}`}
                />

                {/* Personalised name on preview card (Centered, custom size & layout) */}
                {guestName && (() => {
                  const style = getEnvelopeGuestNameInlineStyle(guestName, guestScale);
                  return (
                    <div 
                      className="absolute z-20 pointer-events-none flex flex-col items-center justify-center text-center px-1"
                      style={{
                        left: '20%',
                        right: '20%',
                        top: '55.6%',
                        height: '9.9%',
                      }}
                    >
                      <span 
                        className="font-bold italic text-[#580517] tracking-tight whitespace-pre-line"
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
          </div>

          {/* Front Pocket Triangle Left & Right Folds */}
          <div className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-500 ${isOpening ? 'opacity-0' : 'opacity-100'}`}>
            {/* Left triangle */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-[#440514] to-[#54071b] border-r border-[#d4af37]/25 shadow-md"
              style={{
                clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
              }}
            />
            {/* Right triangle */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#440514] to-[#54071b] border-l border-[#d4af37]/25 shadow-md"
              style={{
                clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
              }}
            />
            {/* Bottom triangle fold */}
            <div 
              className="absolute left-0 right-0 bottom-0 h-3/5 bg-gradient-to-t from-[#36030f] via-[#480616] to-[#58081c] border-t border-[#d4af37]/40 shadow-inner"
              style={{
                clipPath: 'polygon(0 100%, 50% 15%, 100% 100%)',
              }}
            >
              {/* Gold foiled bottom label on pocket */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center w-full px-4">
                <span className="font-serif italic text-[11px] sm:text-xs text-[#d4af37]/90 tracking-wider">
                  Royal Wedding Celebration
                </span>
                <p className="text-[10px] uppercase font-['Cinzel'] tracking-[0.2em] text-[#faedd0]/70 mt-0.5">
                  Udaipur · Rajasthan
                </p>
              </div>
            </div>
          </div>

          {/* Top Flap (Flips open upwards on tap) */}
          <div 
            className="absolute top-0 left-0 right-0 h-3/5 z-30 pointer-events-none origin-top transition-all duration-700 ease-in-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: isOpening ? 'rotateX(180deg)' : 'rotateX(0deg)',
            }}
          >
            {/* Top flap shape */}
            <div 
              className="w-full h-full bg-gradient-to-b from-[#5c081d] via-[#4d0617] to-[#3a0411] border-b border-[#d4af37]/50 shadow-xl"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            >
              <div 
                className="w-full h-full opacity-30"
                style={{
                  clipPath: 'polygon(5% 5%, 95% 5%, 50% 92%)',
                  border: '1px solid #d4af37',
                }}
              />
            </div>
          </div>

          {/* Center Royal Gold Wax Seal */}
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 z-40 transition-all duration-500 ease-out ${
              isOpening 
                ? 'scale-125 opacity-0 pointer-events-none' 
                : 'opacity-100 group-hover:scale-105 active:scale-95'
            }`}
          >
            <div className="relative flex items-center justify-center">
              {/* Outer Golden Glow Pulse */}
              <div className="absolute -inset-2 rounded-full bg-amber-400/30 blur-md animate-pulse" />
              
              {/* Wax Seal Medallion */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#ffd97d] via-[#c99738] to-[#7a5511] p-1 shadow-2xl border border-[#ffeaa7]">
                {/* Fluted / Scalloped Wax Rim */}
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#966d1f] via-[#deb24e] to-[#fde599] flex flex-col items-center justify-center border border-[#815a13] shadow-inner text-[#3d2703]">
                  {/* Crest Initial Monogram */}
                  <span className="font-['Cinzel'] font-bold text-sm sm:text-base tracking-tighter leading-none drop-shadow-sm">
                    W & A
                  </span>
                  <div className="w-6 h-[1px] bg-[#614006] my-0.5 opacity-60" />
                  <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest leading-none text-[#523504]">
                    SEAL
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Call to action prompt below envelope */}
      <div className={`relative z-20 mt-6 text-center animate-bounce duration-1000 transition-opacity duration-300 ${isOpening ? 'opacity-0' : 'opacity-100'}`}>
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#941935] via-[#a81e3e] to-[#941935] text-[#faedd0] text-sm font-semibold tracking-wider border border-[#d4af37]/60 shadow-lg shadow-black/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-ping" />
          <span>{isOpening ? 'Unsealing Invitation...' : 'Tap Envelope to Open'}</span>
        </button>
        <p className="text-[#e2caa0]/70 text-xs mt-2 font-serif italic">
          Touch the seal to reveal the auspicious wedding cards
        </p>
      </div>
    </div>
  );
}
