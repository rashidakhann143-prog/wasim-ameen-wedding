import { useState, useEffect } from 'react';
import { Heart, Send, Sparkles, X } from 'lucide-react';
import { GuestWish } from '../types';

interface GuestbookModalProps {
  onClose: () => void;
}

const DEFAULT_WISHES: GuestWish[] = [
  {
    id: '1',
    name: 'Farhan & Family',
    city: 'Jaipur',
    message: 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fee khair! Heartiest congratulations to Wasim and Ameen!',
    timestamp: 'Just now',
    reactions: 14,
  },
  {
    id: '2',
    name: 'Tariq Sheikh',
    city: 'Udaipur',
    message: 'May Allah shower infinite blessings, happiness, and love upon the beautiful couple Wasim & Ameen.',
    timestamp: '2 hours ago',
    reactions: 9,
  },
  {
    id: '3',
    name: 'Zeenat Bano',
    city: 'Ahmedabad',
    message: 'Mubarak to Kamrunnisha ji and the entire family on this joyous occasion! Looking forward to the Nikah & Baraat.',
    timestamp: 'Yesterday',
    reactions: 18,
  },
];

export default function GuestbookModal({ onClose }: GuestbookModalProps) {
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wasim_ameen_wishes');
      if (stored) {
        setWishes(JSON.parse(stored));
      } else {
        setWishes(DEFAULT_WISHES);
        localStorage.setItem('wasim_ameen_wishes', JSON.stringify(DEFAULT_WISHES));
      }
    } catch {
      setWishes(DEFAULT_WISHES);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    const newWish: GuestWish = {
      id: Date.now().toString(),
      name: name.trim(),
      city: city.trim() || undefined,
      message: message.trim(),
      timestamp: 'Just now',
      reactions: 1,
    };

    const updated = [newWish, ...wishes];
    setWishes(updated);
    try {
      localStorage.setItem('wasim_ameen_wishes', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    setName('');
    setCity('');
    setMessage('');
    setIsSubmitting(false);
  };

  const handleLike = (id: string) => {
    const updated = wishes.map((w) =>
      w.id === id ? { ...w, reactions: (w.reactions || 0) + 1 } : w
    );
    setWishes(updated);
    try {
      localStorage.setItem('wasim_ameen_wishes', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#22020a] border-t sm:border border-[#d4af37]/40 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 text-[#f8ede3] shadow-2xl max-h-[85vh] overflow-y-auto ios-scroll-container flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#8c122e] flex items-center justify-center text-[#ffd700]">
              <Heart size={18} />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-lg text-[#faedd0]">
                Blessings & Mubarak
              </h3>
              <p className="text-xs text-[#d4af37]">
                Send your prayers to Wasim & Ameen
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="my-4 p-4 rounded-xl bg-[#320410] border border-[#d4af37]/25 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tariq Khan & Family"
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#1e0209] border border-[#d4af37]/30 text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-1">
                City / Location (Optional)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Udaipur / Mumbai"
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#1e0209] border border-[#d4af37]/30 text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-1">
              Your Message & Dua *
            </label>
            <textarea
              required
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your congratulations and blessings for the couple..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#1e0209] border border-[#d4af37]/30 text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !message.trim()}
            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[#941935] to-[#b32042] text-[#faedd0] border border-[#d4af37]/50 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Send size={13} className="text-[#ffd700]" />
            <span>Send Mubarak & Blessings</span>
          </button>
        </form>

        {/* Wishes Feed */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="flex items-center gap-1.5 text-xs text-[#d4af37] font-semibold">
            <Sparkles size={13} />
            <span>Guest Wishes ({wishes.length})</span>
          </div>

          {wishes.map((w) => (
            <div 
              key={w.id}
              className="p-3 rounded-xl bg-[#2a030d] border border-[#d4af37]/15 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#faedd0]">
                  {w.name} {w.city && <span className="text-[10px] font-normal text-neutral-400">· {w.city}</span>}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {w.timestamp}
                </span>
              </div>
              <p className="text-xs text-neutral-200 mt-1.5 leading-relaxed font-serif">
                "{w.message}"
              </p>
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-end">
                <button
                  onClick={() => handleLike(w.id)}
                  className="flex items-center gap-1.5 text-[11px] text-[#ffd700] hover:text-white px-2 py-0.5 rounded bg-white/5 active:scale-90 transition-all"
                >
                  <Heart size={11} className="fill-current text-rose-400" />
                  <span>{w.reactions || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
