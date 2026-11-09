/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import Envelope from './components/Envelope';
import CardsViewer from './components/CardsViewer';
import CardLightbox from './components/CardLightbox';
import CalendarModal from './components/CalendarModal';
import VenuesModal from './components/VenuesModal';
import GuestbookModal from './components/GuestbookModal';
import GuestLinkGeneratorModal from './components/GuestLinkGeneratorModal';
import BottomToolbar from './components/BottomToolbar';
import RosePetalsCanvas from './components/RosePetalsCanvas';
import MusicToggle from './components/MusicToggle';
import { WeddingCard } from './types';
import { startAmbientCelebrationMusic, resumeAudioContextIfNeeded, preloadBackgroundMusic } from './utils/audio';
import { parseGuestScale } from './utils/guestFont';
import { OWNER_EXPERIENCE_SETTINGS } from './config/experienceSettings';

const WEDDING_CARDS: WeddingCard[] = [
  {
    id: 1,
    title: 'Wedding Invitation',
    subtitle: 'Wednesday, 18th November 2026',
    badge: 'Cover Card',
    src: '/assets/aistudio/3A77DB38-2A8A-4DBB-891D-8A802342226D_02db4e9e.png',
    alt: 'Wedding Invitation: Wasim Weds Ameen, Wednesday 18th November 2026, Udaipur',
  },
  {
    id: 2,
    title: 'Wedding Ceremony Announcement',
    subtitle: 'In the name of ALLAH, Most Merciful',
    badge: 'Nikah Announcement',
    src: '/assets/aistudio/E0B1FA32-3A05-4EAC-BCCD-97CE00566354_be13778f.png',
    alt: 'Wedding Announcement: Son Wasim weds Ameen, Mrs. Kamrunnisha & Late Mr. Fakir Mohammed Sb.',
  },
  {
    id: 3,
    title: 'Wedding Programmes & Reception',
    subtitle: 'Haldi, Milad, Nikah & Reception at Raza Bagh',
    badge: 'Programmes',
    src: '/assets/aistudio/E88C7F04-9631-4B96-864B-D8D3D63E44B2_5e443dd4.png',
    alt: 'Programmes: Rasm-e-Haldi, Mehfil-e-Milad, Nikah Ceremony, Reception & Dinner at Raza Bagh Udaipur',
  },
  {
    id: 4,
    title: 'Baraat Departure',
    subtitle: 'Tuesday, 17th November 2026 · 9:00 AM',
    badge: 'Baraat',
    src: '/assets/aistudio/13268347-C392-4E3C-AB5B-57A3AFFAD78E_7f590ddb.png',
    alt: 'Baraat Departure: Tuesday 17th Nov 2026 at 9:00 AM from Residence to Ahmedabad',
  },
];

// Robust query parameter parser supporting both window.location.search and hash query parameters on Netlify
function parseInitialGuestParams(): { name: string; scale: number } {
  if (typeof window === 'undefined') return { name: '', scale: 1.0 };
  
  let toParam: string | null = null;
  let sizeParam: string | null = null;

  // 1. Search in window.location.search (?to=...&size=...)
  if (window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    toParam = searchParams.get('to');
    sizeParam = searchParams.get('size');
  }

  // 2. Search in window.location.hash if not found (e.g. /#?to=... or /#/?to=...)
  if (!toParam && window.location.hash && window.location.hash.includes('?')) {
    const hashQuery = window.location.hash.substring(window.location.hash.indexOf('?') + 1);
    const hashParams = new URLSearchParams(hashQuery);
    toParam = hashParams.get('to');
    if (!sizeParam) sizeParam = hashParams.get('size');
  }

  if (toParam) {
    // Support literal \n characters if entered directly into URL bar
    if (toParam.includes('\\n')) {
      toParam = toParam.replace(/\\n/g, '\n');
    }
  }

  return {
    name: toParam ? toParam.trim() : '',
    scale: parseGuestScale(sizeParam),
  };
}

export default function App() {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [lightboxCardIndex, setLightboxCardIndex] = useState<number | null>(null);
  
  // Initial params parsed from URL (?to=...&size=...)
  const initialParams = parseInitialGuestParams();
  const [guestName, setGuestName] = useState<string>(initialParams.name);
  const [guestScale, setGuestScale] = useState<number>(initialParams.scale);

  // Modals
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isVenuesOpen, setIsVenuesOpen] = useState(false);
  const [isGuestbookOpen, setIsGuestbookOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('generator') || params.has('admin');
    }
    return false;
  });
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global mobile gesture unlock to guarantee background music permission on iPhone Safari
  useEffect(() => {
    if (!OWNER_EXPERIENCE_SETTINGS.ENABLE_BACKGROUND_MUSIC) return;

    // Download the romantic piano track early so it starts promptly on envelope tap
    preloadBackgroundMusic();

    const unlockAudio = () => {
      resumeAudioContextIfNeeded();
    };

    window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
    window.addEventListener('click', unlockAudio, { passive: true, once: true });

    return () => {
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
  }, []);

  // Live preview guest without refreshing page
  const handlePreviewGuest = useCallback((name: string, scale: number = 1.0) => {
    setGuestName(name);
    setGuestScale(scale);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (name.trim()) {
        url.searchParams.set('to', name.trim());
        if (Math.abs(scale - 0.85) < 0.03) {
          url.searchParams.set('size', 'sm');
        } else if (Math.abs(scale - 1.22) < 0.03) {
          url.searchParams.set('size', 'lg');
        } else if (Math.abs(scale - 1.0) >= 0.03) {
          url.searchParams.set('size', Math.round(scale * 100).toString());
        } else {
          url.searchParams.delete('size');
        }
      } else {
        url.searchParams.delete('to');
        url.searchParams.delete('size');
      }
      window.history.pushState({}, '', url.toString());
    }
  }, []);

  // Scroll to card handler
  const handleScrollToCard = useCallback((index: number) => {
    setActiveCardIndex(index);
    const element = document.getElementById(`card-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Envelope open callback
  const handleEnvelopeOpened = useCallback(() => {
    setIsEnvelopeOpen(true);
    // Ensure celebration music is running
    if (OWNER_EXPERIENCE_SETTINGS.ENABLE_BACKGROUND_MUSIC) {
      startAmbientCelebrationMusic();
    }
    // Auto-scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Envelope replay callback (preserves continuous background music)
  const handleReopenEnvelope = useCallback(() => {
    setIsEnvelopeOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Share invitation
  const handleShare = useCallback(async () => {
    let targetUrl = window.location.href;
    const isPreview = typeof window !== 'undefined' && (
      window.location.hostname.includes('run.app') ||
      window.location.hostname.includes('google') ||
      window.location.hostname.includes('localhost') ||
      window.location.hostname === '127.0.0.1'
    );
    if (isPreview) {
      const storedBase = typeof localStorage !== 'undefined' ? localStorage.getItem('wasim_ameen_custom_base_url') : null;
      const base = (storedBase && storedBase.trim()) ? storedBase.trim().replace(/\/+$/, '') : 'https://wasim-ameen-wedding.netlify.app';
      targetUrl = `${base}/${window.location.search}`;
    }

    const shareData = {
      title: 'Wasim & Ameen Wedding Invitation',
      text: 'Cordially inviting you to celebrate the wedding of Wasim & Ameen! View the royal invitation cards:',
      url: targetUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setToastMessage('Invitation link copied to clipboard!');
        setTimeout(() => setToastMessage(null), 3000);
      } catch {
        setToastMessage('Link ready to share!');
        setTimeout(() => setToastMessage(null), 2500);
      }
    }
  }, []);

  // Scroll spy to update active tab when guest scrolls
  useEffect(() => {
    if (!isEnvelopeOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const index = parseInt(id.replace('card-', ''), 10);
            if (!isNaN(index)) {
              setActiveCardIndex(index);
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    WEDDING_CARDS.forEach((_, idx) => {
      const el = document.getElementById(`card-${idx}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isEnvelopeOpen]);

  return (
    <div className="min-h-[100dvh] bg-[#160207] text-[#faedd0] relative font-sans">
      {/* Falling Rose Petals Ambient Layer (Locked ON by Owner Settings) */}
      <RosePetalsCanvas isEnabled={OWNER_EXPERIENCE_SETTINGS.ENABLE_FALLING_PETALS} />

      {/* Main Experience: Either Clickable Burgundy Envelope or Revealed Scrollable Cards */}
      {!isEnvelopeOpen ? (
        <Envelope
          firstCardSrc={WEDDING_CARDS[0].src}
          guestName={guestName}
          guestScale={guestScale}
          onOpenComplete={handleEnvelopeOpened}
          onOpenGenerator={() => setIsGeneratorOpen(true)}
        />
      ) : (
        <>
          <CardsViewer
            cards={WEDDING_CARDS}
            activeCardIndex={activeCardIndex}
            guestName={guestName}
            guestScale={guestScale}
            onSelectCardForZoom={(idx) => setLightboxCardIndex(idx)}
            onScrollToCard={handleScrollToCard}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenVenues={() => setIsVenuesOpen(true)}
            onOpenGuestbook={() => setIsGuestbookOpen(true)}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onReopenEnvelope={handleReopenEnvelope}
          />

          {/* Fixed Bottom Action Dock for Thumb Navigation on iPhone */}
          <BottomToolbar
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenVenues={() => setIsVenuesOpen(true)}
            onOpenGuestbook={() => setIsGuestbookOpen(true)}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onShare={handleShare}
          />
        </>
      )}

      {/* Fullscreen High-Resolution Lightbox */}
      {lightboxCardIndex !== null && (
        <CardLightbox
          cards={WEDDING_CARDS}
          initialIndex={lightboxCardIndex}
          guestName={guestName}
          guestScale={guestScale}
          onClose={() => setLightboxCardIndex(null)}
        />
      )}

      {/* Guest Name & Link Generator Modal */}
      {isGeneratorOpen && (
        <GuestLinkGeneratorModal
          currentGuestName={guestName}
          currentGuestScale={guestScale}
          onPreviewGuest={handlePreviewGuest}
          onClose={() => setIsGeneratorOpen(false)}
        />
      )}

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <CalendarModal onClose={() => setIsCalendarOpen(false)} />
      )}

      {/* Venues & Directions Modal */}
      {isVenuesOpen && (
        <VenuesModal onClose={() => setIsVenuesOpen(false)} />
      )}

      {/* Guestbook & Wishes Modal */}
      {isGuestbookOpen && (
        <GuestbookModal onClose={() => setIsGuestbookOpen(false)} />
      )}

      {/* Background music on/off control */}
      {OWNER_EXPERIENCE_SETTINGS.ENABLE_BACKGROUND_MUSIC && <MusicToggle raised={isEnvelopeOpen} />}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#8c122e] text-[#ffd700] px-4 py-2 rounded-full text-xs font-semibold shadow-2xl border border-[#d4af37]/60 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
