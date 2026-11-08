import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Link2, Copy, Check, MessageSquare, Plus, Trash2, 
  ExternalLink, Globe, Sparkles, X, Users, Sliders, Split
} from 'lucide-react';
import { getGuestNameInlineStyle } from '../utils/guestFont';

interface GuestLinkGeneratorModalProps {
  currentGuestName: string;
  currentGuestScale?: number;
  onPreviewGuest: (name: string, scale?: number) => void;
  onClose: () => void;
}

interface SavedGuestItem {
  id: string;
  name: string;
  scale: number;
  url: string;
  timestamp: string;
}

const STORAGE_KEY = 'wasim_ameen_generated_guests';
const BASE_URL_STORAGE_KEY = 'wasim_ameen_custom_base_url';

export default function GuestLinkGeneratorModal({
  currentGuestName,
  currentGuestScale = 1.0,
  onPreviewGuest,
  onClose,
}: GuestLinkGeneratorModalProps) {
  // Parse initial state for layout & lines
  const initialIsDoubleLine = currentGuestName.includes('\n');
  const initialLines = currentGuestName ? currentGuestName.split('\n') : ['', ''];

  const [layoutMode, setLayoutMode] = useState<'single' | 'double'>(initialIsDoubleLine ? 'double' : 'single');
  const [singleLineText, setSingleLineText] = useState(currentGuestName.replace(/\n+/g, ' ') || '');
  const [line1, setLine1] = useState(initialLines[0] || '');
  const [line2, setLine2] = useState(initialLines.slice(1).join(' ') || '');
  
  // Font scale (0.7 to 1.4, default 1.0)
  const [fontScale, setFontScale] = useState<number>(currentGuestScale || 1.0);

  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [showUrlSettings, setShowUrlSettings] = useState(false);
  const [savedGuests, setSavedGuests] = useState<SavedGuestItem[]>([]);
  
  const singleInputRef = useRef<HTMLInputElement | null>(null);
  const line1InputRef = useRef<HTMLInputElement | null>(null);

  // Compute the combined effective name string
  const effectiveName = useMemo(() => {
    if (layoutMode === 'double') {
      const p1 = line1.trim();
      const p2 = line2.trim();
      if (p1 && p2) return `${p1}\n${p2}`;
      if (p1) return p1;
      return p2;
    }
    return singleLineText.trim();
  }, [layoutMode, singleLineText, line1, line2]);

  // Load initial settings and saved guests
  useEffect(() => {
    try {
      const storedGuests = localStorage.getItem(STORAGE_KEY);
      if (storedGuests) {
        setSavedGuests(JSON.parse(storedGuests));
      }
      const storedBaseUrl = localStorage.getItem(BASE_URL_STORAGE_KEY);
      if (storedBaseUrl) {
        setCustomBaseUrl(storedBaseUrl);
      }
    } catch {
      // Ignore local storage error
    }

    // Auto-focus input on mount
    setTimeout(() => {
      if (layoutMode === 'single') singleInputRef.current?.focus();
      else line1InputRef.current?.focus();
    }, 150);
  }, []);

  // Sync live preview to Card 1 in the background whenever name, layout, or font scale changes
  useEffect(() => {
    onPreviewGuest(effectiveName, fontScale);
  }, [effectiveName, fontScale, onPreviewGuest]);

  // Switch to Double Line and intelligently suggest split
  const handleSwitchToDoubleLine = () => {
    setLayoutMode('double');
    if (!line1 && !line2 && singleLineText.trim()) {
      const text = singleLineText.trim();
      // Try splitting before "From" or "With Family"
      const fromMatch = text.match(/^(.*?)\s+(From\s+.*)$/i);
      const withFamilyMatch = text.match(/^(.*?)\s+(With\s+Family.*)$/i);
      
      if (fromMatch && fromMatch[1] && fromMatch[2]) {
        setLine1(fromMatch[1].trim());
        setLine2(fromMatch[2].trim());
      } else if (withFamilyMatch && withFamilyMatch[1] && withFamilyMatch[2]) {
        setLine1(withFamilyMatch[1].trim());
        setLine2(withFamilyMatch[2].trim());
      } else {
        // Split roughly around middle word
        const words = text.split(/\s+/);
        if (words.length > 2) {
          const mid = Math.ceil(words.length / 2);
          setLine1(words.slice(0, mid).join(' '));
          setLine2(words.slice(mid).join(' '));
        } else {
          setLine1(text);
          setLine2('');
        }
      }
    }
  };

  // Switch to Single Line
  const handleSwitchToSingleLine = () => {
    setLayoutMode('single');
    const combined = [line1.trim(), line2.trim()].filter(Boolean).join(' ');
    if (combined) {
      setSingleLineText(combined);
    }
  };

  // Detect if running inside Google AI Studio / sandbox preview vs deployed website
  const isPreview = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    return (
      host.includes('run.app') ||
      host.includes('google') ||
      host.includes('localhost') ||
      host === '127.0.0.1' ||
      host === '0.0.0.0'
    );
  }, []);

  // Compute active base URL:
  // - On deployed Netlify website: strictly uses window.location.origin
  // - In Google AI Studio preview: prevents generating run.app preview links, falls back to custom Netlify URL or saved Netlify domain
  const getActiveBaseUrl = useCallback(() => {
    if (!isPreview) {
      // Live deployed Netlify website: strictly use window.location.origin
      if (customBaseUrl.trim()) {
        let url = customBaseUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        return url.replace(/\/+$/, '');
      }
      return window.location.origin.replace(/\/+$/, '');
    }

    // Inside Google AI Studio Preview: NEVER emit run.app or preview URLs
    if (customBaseUrl.trim()) {
      let url = customBaseUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      return url.replace(/\/+$/, '');
    }

    // Default Netlify URL fallback in preview mode so user never generates run.app links
    return 'https://wasim-ameen-wedding.netlify.app';
  }, [isPreview, customBaseUrl]);

  // Size parameter string for URL
  const getSizeParamCode = (scale: number): string => {
    if (Math.abs(scale - 0.85) < 0.03) return 'sm';
    if (Math.abs(scale - 1.0) < 0.03) return 'md';
    if (Math.abs(scale - 1.22) < 0.03) return 'lg';
    return Math.round(scale * 100).toString();
  };

  const buildPersonalizedUrl = useCallback((nameText: string, scale: number): string => {
    const base = getActiveBaseUrl().replace(/\/+$/, '');
    const sizeParam = getSizeParamCode(scale);
    let url = `${base}/?to=${encodeURIComponent(nameText.trim())}`;
    if (sizeParam !== 'md') {
      url += `&size=${sizeParam}`;
    }
    return url;
  }, [getActiveBaseUrl]);

  const handleGenerate = () => {
    if (!effectiveName.trim()) return;

    const url = buildPersonalizedUrl(effectiveName, fontScale);

    setGeneratedLink(url);
    setCopiedLink(false);

    // Save to list
    const newItem: SavedGuestItem = {
      id: Date.now().toString(),
      name: effectiveName.trim(),
      scale: fontScale,
      url,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSavedGuests((prev) => {
      const filtered = prev.filter((g) => g.name.toLowerCase() !== effectiveName.toLowerCase());
      const updated = [newItem, ...filtered];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleCopyLink = async (textToCopy: string, itemId?: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (itemId) {
        setCopiedId(itemId);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (itemId) {
        setCopiedId(itemId);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const handleSaveBaseUrl = (url: string) => {
    setCustomBaseUrl(url);
    try {
      localStorage.setItem(BASE_URL_STORAGE_KEY, url);
    } catch {
      // Ignore
    }
  };

  const handleClearInput = () => {
    setSingleLineText('');
    setLine1('');
    setLine2('');
    setGeneratedLink('');
    setCopiedLink(false);
    if (layoutMode === 'single') singleInputRef.current?.focus();
    else line1InputRef.current?.focus();
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedGuests.filter((g) => g.id !== id);
    setSavedGuests(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleClearAllSaved = () => {
    if (window.confirm('Clear all saved guest links?')) {
      setSavedGuests([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  };

  // Resolve clean guest share URL guaranteeing live Netlify links and no sandbox preview links
  const getGuestShareUrl = useCallback((item: SavedGuestItem): string => {
    // If the saved URL contains temporary run.app / google preview or lacks active base:
    if (!item.url || item.url.includes('run.app') || item.url.includes('googleusercontent')) {
      return buildPersonalizedUrl(item.name, item.scale || 1.0);
    }
    // If running on live deployed site (!isPreview), ensure it uses window.location.origin
    if (!isPreview && typeof window !== 'undefined') {
      try {
        const parsed = new URL(item.url);
        if (parsed.origin !== window.location.origin) {
          return buildPersonalizedUrl(item.name, item.scale || 1.0);
        }
      } catch {
        return buildPersonalizedUrl(item.name, item.scale || 1.0);
      }
    }
    return item.url;
  }, [isPreview, buildPersonalizedUrl]);

  const getWhatsAppShareUrl = (guestNameText: string, link: string) => {
    const text = `Assalamu Alaikum! Cordially inviting you and your family to celebrate the wedding ceremony of Wasim & Ameen.\n\nPlease view your personalised invitation card here:\n${link}\n\nVenue: Udaipur, Rajasthan`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  // Compute live styling for mini preview card
  const miniPreviewStyle = useMemo(() => {
    return getGuestNameInlineStyle(effectiveName, fontScale, layoutMode === 'single');
  }, [effectiveName, fontScale, layoutMode]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#22020a] border-t sm:border border-[#d4af37]/40 rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 text-[#f8ede3] shadow-2xl max-h-[92vh] overflow-y-auto ios-scroll-container flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/25">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#8c122e] flex items-center justify-center text-[#ffd700] border border-[#d4af37]/30 shadow-inner">
              <Link2 size={18} />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-base sm:text-lg text-[#faedd0]">
                Guest Name Generator
              </h3>
              <p className="text-[11px] text-[#d4af37]">
                Personalised invitations for 50+ guests with custom font size & layout
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white cursor-pointer"
            aria-label="Close generator"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Mini Card 1 Preview */}
        <div className="my-3 p-3 rounded-xl bg-gradient-to-b from-[#FAF1E3] to-[#F5EADB] border-2 border-[#d4af37]/60 shadow-xl text-center relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-wider text-[#732a38] font-bold">
              Live Card 1 Preview Below “To,”
            </span>
            <span className="text-[9px] text-[#8c122e] font-serif italic">
              Scale: {Math.round(fontScale * 100)}% · {layoutMode === 'single' ? 'Single Line' : 'Double Line'}
            </span>
          </div>

          {/* Mini Replica of Card 1 "To," Zone */}
          <div className="py-2.5 px-3 min-h-[72px] flex flex-col items-center justify-center relative rounded-md border border-[#d4af37]/20 bg-[#FAF1E3]/80">
            {/* "To," label in upper left */}
            <span 
              className="absolute top-1 left-2.5 text-xs font-bold text-[#5c081d]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              To,
            </span>

            {/* Centered guest name with live typography */}
            {effectiveName ? (
              <span 
                className="font-bold italic text-[#580517] tracking-tight whitespace-pre-line drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]"
                style={{ 
                  fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                  fontSize: miniPreviewStyle.fontSize,
                  lineHeight: miniPreviewStyle.lineHeight,
                }}
              >
                {effectiveName}
              </span>
            ) : (
              <span className="text-xs text-[#8c122e]/40 italic font-serif">
                (Guest name will appear here centered)
              </span>
            )}
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-3.5">
          {/* 1. Layout Mode Switcher (Single Line vs Double Line) */}
          <div>
            <label className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5">
                <Split size={13} />
                <span>Name Layout</span>
              </span>
              <span className="text-[10px] text-neutral-400 lowercase font-normal">
                {layoutMode === 'single' ? 'fits on 1 line' : 'custom line break'}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#160207] rounded-xl border border-[#d4af37]/30">
              <button
                type="button"
                onClick={handleSwitchToSingleLine}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  layoutMode === 'single'
                    ? 'bg-gradient-to-r from-[#8c122e] to-[#a8193a] text-[#ffd700] shadow-md border border-[#d4af37]/40'
                    : 'text-[#faedd0]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Single Line</span>
              </button>

              <button
                type="button"
                onClick={handleSwitchToDoubleLine}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  layoutMode === 'double'
                    ? 'bg-gradient-to-r from-[#8c122e] to-[#a8193a] text-[#ffd700] shadow-md border border-[#d4af37]/40'
                    : 'text-[#faedd0]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Double Line (Break)</span>
              </button>
            </div>
          </div>

          {/* 2. Guest Name Text Inputs based on Layout Mode */}
          {layoutMode === 'single' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold flex items-center gap-1.5">
                  <Users size={13} />
                  <span>Guest / Family Name (Single Line)</span>
                </label>
                {singleLineText && (
                  <button
                    onClick={handleClearInput}
                    className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  ref={singleInputRef}
                  type="text"
                  value={singleLineText}
                  onChange={(e) => setSingleLineText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  placeholder="e.g. Jainu Jamali With Family"
                  className="w-full pl-3.5 pr-9 py-2.5 text-sm rounded-xl bg-[#320410] border border-[#d4af37]/40 text-[#faedd0] placeholder-[#d4af37]/40 focus:outline-none focus:border-[#d4af37] shadow-inner"
                />
                {singleLineText && (
                  <button
                    onClick={handleClearInput}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold flex items-center gap-1.5">
                  <Users size={13} />
                  <span>Double Line Guest Name</span>
                </label>
                {(line1 || line2) && (
                  <button
                    onClick={handleClearInput}
                    className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Line 1 */}
              <div>
                <span className="text-[10px] text-[#e6ca85] block mb-1 font-medium">Line 1 (e.g. Name / Family):</span>
                <input
                  ref={line1InputRef}
                  type="text"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="e.g. Jainu Jamali With Family"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[#320410] border border-[#d4af37]/40 text-[#faedd0] placeholder-[#d4af37]/40 focus:outline-none focus:border-[#d4af37] shadow-inner"
                />
              </div>

              {/* Line 2 */}
              <div>
                <span className="text-[10px] text-[#e6ca85] block mb-1 font-medium">Line 2 (e.g. City / Relation):</span>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="e.g. From London"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[#320410] border border-[#d4af37]/40 text-[#faedd0] placeholder-[#d4af37]/40 focus:outline-none focus:border-[#d4af37] shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Quick Helper Chips for Mobile Typing */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-neutral-400 font-medium">Quick Add:</span>
            {[
              'With Family',
              '& Family',
              'From London',
              'From Udaipur',
              'From Ahmedabad',
            ].map((suffix) => (
              <button
                key={suffix}
                type="button"
                onClick={() => {
                  if (layoutMode === 'double') {
                    if (!line2.trim()) setLine2(suffix);
                    else setLine2(`${line2.trim()} ${suffix}`);
                  } else {
                    const clean = singleLineText.trim();
                    setSingleLineText(clean ? `${clean} ${suffix}` : suffix);
                  }
                }}
                className="px-2 py-0.5 rounded-md bg-[#420515] hover:bg-[#58071c] text-[#ffd700] text-[11px] border border-[#d4af37]/25 active:scale-95 transition-all cursor-pointer"
              >
                + {suffix}
              </button>
            ))}
          </div>

          {/* 3. Font Size Controls: Slider + Small, Medium, Large Presets */}
          <div className="p-3 rounded-xl bg-[#1d0208] border border-[#d4af37]/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold flex items-center gap-1.5">
                <Sliders size={13} />
                <span>Font Size Control</span>
              </label>
              <span className="px-2 py-0.5 rounded-md bg-[#8c122e] text-[#ffd700] text-xs font-mono font-bold border border-[#d4af37]/30">
                {Math.round(fontScale * 100)}%
              </span>
            </div>

            {/* Presets: Small, Medium, Large */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Small', scale: 0.85, desc: '85%' },
                { label: 'Medium', scale: 1.0, desc: '100% (Default)' },
                { label: 'Large', scale: 1.22, desc: '122%' },
              ].map((p) => {
                const isActive = Math.abs(fontScale - p.scale) < 0.04;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setFontScale(p.scale)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#8c122e] text-[#ffd700] border border-[#ffd700]/70 shadow-sm'
                        : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[9px] opacity-75">{p.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[10px] text-neutral-400 font-mono">70%</span>
              <input
                type="range"
                min="0.70"
                max="1.35"
                step="0.05"
                value={fontScale}
                onChange={(e) => setFontScale(parseFloat(e.target.value))}
                className="flex-1 accent-[#d4af37] h-2 bg-[#360412] rounded-lg appearance-none cursor-pointer"
                aria-label="Adjust font size"
              />
              <span className="text-[10px] text-neutral-400 font-mono">135%</span>
            </div>
          </div>

          {/* Target Website URL Settings (Netlify support) */}
          <div className="pt-0.5 space-y-2">
            {!isPreview ? (
              /* Live Deployed Netlify Website indicator */
              <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                      Live Netlify Base URL (window.location.origin)
                    </span>
                    <span className="text-xs font-mono text-emerald-100 truncate block">
                      {getActiveBaseUrl()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUrlSettings(!showUrlSettings)}
                  className="text-[10px] text-[#e6ca85] hover:text-white underline shrink-0 cursor-pointer"
                >
                  {showUrlSettings ? 'Close' : 'Custom Domain'}
                </button>
              </div>
            ) : (
              /* Inside Google AI Studio Preview: Safe Mode */
              <div className="p-3 rounded-xl bg-[#28040d] border border-[#d4af37]/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#ffd700] font-semibold flex items-center gap-1.5">
                    <Globe size={13} className="text-[#ffd700]" />
                    <span>Target Netlify Website</span>
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    AI Studio Preview Links Blocked
                  </span>
                </div>
                <p className="text-[11px] text-[#faedd0]/80 leading-snug">
                  Temporary <code className="text-rose-300 font-mono">.run.app</code> preview links are blocked so guests never receive expired sandbox URLs. Links are generated for your live Netlify website:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customBaseUrl}
                    onChange={(e) => handleSaveBaseUrl(e.target.value)}
                    placeholder="https://wasim-ameen-wedding.netlify.app"
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#140105] border border-[#d4af37]/35 text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37] font-mono shadow-inner"
                  />
                  {customBaseUrl && (
                    <button
                      onClick={() => handleSaveBaseUrl('')}
                      className="px-2 py-1 text-[10px] rounded bg-white/10 text-neutral-300 hover:text-white"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-[#ffd700]/70 flex items-center gap-1">
                  <span>Current Link Base:</span>
                  <span className="font-mono text-white font-medium truncate">{getActiveBaseUrl()}</span>
                </div>
              </div>
            )}

            {/* Optional Custom domain override drawer when running on deployed site */}
            {!isPreview && showUrlSettings && (
              <div className="p-2.5 rounded-lg bg-[#2d030e] border border-[#d4af37]/30 space-y-1.5 animate-fade-in">
                <label className="text-[10px] uppercase text-[#d4af37] block font-semibold">
                  Custom Domain Override (Optional):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customBaseUrl}
                    onChange={(e) => handleSaveBaseUrl(e.target.value)}
                    placeholder={typeof window !== 'undefined' ? window.location.origin : 'https://your-site.netlify.app'}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#180207] border border-[#d4af37]/30 text-white placeholder-neutral-500 focus:outline-none font-mono"
                  />
                  {customBaseUrl && (
                    <button
                      onClick={() => handleSaveBaseUrl('')}
                      className="px-2 py-1 text-[10px] rounded bg-white/10 text-neutral-300 hover:text-white"
                    >
                      Reset to window.location.origin
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleGenerate}
              disabled={!effectiveName.trim()}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#941935] via-[#a81e3e] to-[#941935] text-[#faedd0] border border-[#d4af37]/60 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all shadow-lg cursor-pointer"
            >
              <Sparkles size={14} className="text-[#ffd700]" />
              <span>Generate Link</span>
            </button>

            <button
              onClick={() => {
                if (effectiveName.trim()) {
                  onPreviewGuest(effectiveName.trim(), fontScale);
                  onClose();
                }
              }}
              disabled={!effectiveName.trim()}
              className="w-full py-2.5 px-3 rounded-xl bg-[#440514] hover:bg-[#58071a] text-[#ffd700] border border-[#d4af37]/30 text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ExternalLink size={13} />
              <span>Preview on Card</span>
            </button>
          </div>

          {/* Generated Link Result Box */}
          {generatedLink && (
            <div className="p-3.5 rounded-xl bg-[#360412] border-2 border-[#d4af37]/60 shadow-xl space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-[#ffd700] font-semibold">
                <span className="truncate pr-2">Personalised Link:</span>
                <span className="text-[10px] text-emerald-400 font-normal shrink-0">Ready to share</span>
              </div>

              <div className="p-2 rounded-lg bg-[#1a0208] border border-[#d4af37]/30 text-xs font-mono break-all text-[#faedd0]">
                {generatedLink}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCopyLink(generatedLink)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#d4af37] hover:bg-[#e6ca85] text-[#340411]'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={getWhatsAppShareUrl(effectiveName.trim(), generatedLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <MessageSquare size={14} />
                  <span>Send WhatsApp</span>
                </a>
              </div>

              {/* Enter another name prompt */}
              <div className="pt-1 text-center">
                <button
                  onClick={handleClearInput}
                  className="text-xs text-[#ffd700] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Enter another guest name</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Previously Generated Guests List */}
        <div className="flex-1 mt-3 border-t border-[#d4af37]/20 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#faedd0] flex items-center gap-1.5">
              <span>Saved Guest Links</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#8c122e] text-[#ffd700] text-[10px] font-mono">
                {savedGuests.length}
              </span>
            </span>

            {savedGuests.length > 0 && (
              <button
                onClick={handleClearAllSaved}
                className="text-[10px] text-neutral-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={11} />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {savedGuests.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-2 text-center">
              No guest links generated yet. Enter names above to create and manage links for 50+ guests.
            </p>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {savedGuests.map((item) => {
                const itemShareUrl = getGuestShareUrl(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.name.includes('\n')) {
                        setLayoutMode('double');
                        const parts = item.name.split('\n');
                        setLine1(parts[0] || '');
                        setLine2(parts.slice(1).join(' ') || '');
                      } else {
                        setLayoutMode('single');
                        setSingleLineText(item.name);
                      }
                      if (item.scale) setFontScale(item.scale);
                      setGeneratedLink(itemShareUrl);
                      onPreviewGuest(item.name, item.scale || 1.0);
                    }}
                    className="p-2.5 rounded-lg bg-[#2e0410] hover:bg-[#3e0516] border border-[#d4af37]/20 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#faedd0] whitespace-pre-line truncate">
                        {item.name.replace('\n', ' · ')}
                      </p>
                      <p className="text-[10px] font-mono text-[#d4af37]/70 truncate">
                        Size: {Math.round((item.scale || 1.0) * 100)}%
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleCopyLink(itemShareUrl, item.id)}
                        className={`p-1.5 rounded text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                          copiedId === item.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-[#ffd700]'
                        }`}
                        title="Copy Link"
                        aria-label={`Copy link for ${item.name}`}
                      >
                        {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                      </button>

                      <a
                        href={getWhatsAppShareUrl(item.name, itemShareUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white transition-all"
                        title="Send on WhatsApp"
                        aria-label={`Send WhatsApp invitation to ${item.name}`}
                      >
                        <MessageSquare size={13} />
                      </a>

                    <button
                      onClick={(e) => handleDeleteSaved(item.id, e)}
                      className="p-1.5 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
                      title="Delete"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-2 text-center text-[10px] text-neutral-400 border-t border-white/5">
          Tip: Selected font size and line breaks are embedded directly in the generated URL (<code className="text-[#ffd700]">?to=...&size=...</code>)!
        </div>
      </div>
    </div>
  );
}
