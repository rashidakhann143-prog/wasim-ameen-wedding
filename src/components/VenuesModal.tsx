import { useState } from 'react';
import { MapPin, Navigation, Phone, MessageSquare, Copy, Check, X } from 'lucide-react';

interface VenuesModalProps {
  onClose: () => void;
}

const VENUES = [
  {
    name: 'Raza Bagh (Reception & Dinner)',
    tag: 'Main Reception Venue · 23 Nov 2026',
    address: 'RAZA BAGH, MG College Road, Near Alipur Masjid, Udaipur, Rajasthan',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Raza+Bagh+MG+College+Road+Near+Alipur+Masjid+Udaipur',
    appleMapsUrl: 'http://maps.apple.com/?q=Raza+Bagh+MG+College+Road+Near+Alipur+Masjid+Udaipur',
  },
  {
    name: 'Residence (Haldi, Milad & Baraat)',
    tag: 'Family Residence · 16 & 17 Nov 2026',
    address: '2, Cement Gali, Dholi Bawari, Udaipur (Raj.) 313001',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=2+Cement+Gali+Dholi+Bawari+Udaipur+Rajasthan',
    appleMapsUrl: 'http://maps.apple.com/?q=2+Cement+Gali+Dholi+Bawari+Udaipur+Rajasthan',
  },
];

const CONTACTS = [
  { name: 'Kamrunnisha (Host)', phone: '+919828797577', display: '98287 97577' },
  { name: 'Family Contact', phone: '+919413243828', display: '94132 43828' },
  { name: 'Family Contact', phone: '+919413286415', display: '94132 86415' },
];

export default function VenuesModal({ onClose }: VenuesModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyAddress = (address: string, idx: number) => {
    navigator.clipboard.writeText(address);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#22020a] border-t sm:border border-[#d4af37]/40 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 text-[#f8ede3] shadow-2xl max-h-[85vh] overflow-y-auto ios-scroll-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#8c122e] flex items-center justify-center text-[#ffd700]">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-lg text-[#faedd0]">
                Venues & Directions
              </h3>
              <p className="text-xs text-[#d4af37]">
                Udaipur, Rajasthan
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

        {/* Venues */}
        <div className="space-y-4 my-4">
          {VENUES.map((v, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-[#320410] border border-[#d4af37]/25 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-[#faedd0]">
                  {v.name}
                </h4>
                <span className="text-[11px] text-[#ffd700] font-medium bg-[#50081a] px-2 py-0.5 rounded">
                  {idx === 0 ? 'Reception' : 'Residence'}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                {v.address}
              </p>

              {/* Navigation Actions */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#d4af37]/15">
                <a
                  href={v.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-lg bg-[#8c122e] hover:bg-[#a61738] text-[#faedd0] text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Navigation size={13} className="text-[#ffd700]" />
                  <span>Google Maps</span>
                </a>
                <button
                  onClick={() => copyAddress(v.address, idx)}
                  className="py-2 px-3 rounded-lg bg-[#440514] hover:bg-[#58071a] text-[#faedd0] border border-[#d4af37]/30 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="text-[#ffd700]" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Contact Numbers from Card 1 */}
          <div className="p-4 rounded-xl bg-[#2a030d] border border-[#d4af37]/20">
            <h4 className="font-['Cinzel'] font-bold text-xs uppercase tracking-wider text-[#d4af37] mb-2">
              Family & Contact Details
            </h4>
            <p className="text-xs text-neutral-300 mb-3">
              Mrs. Kamrunnisha W/o Late Fakir Mohammed Sb.
            </p>
            <div className="space-y-2">
              {CONTACTS.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#3a0614] border border-[#d4af37]/15">
                  <span className="text-xs font-mono text-[#faedd0] font-medium tracking-wide">
                    {c.display}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${c.phone}`}
                      className="px-2.5 py-1 rounded bg-[#8c122e] hover:bg-[#a61738] text-white text-[11px] font-medium flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Phone size={11} />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://wa.me/${c.phone.replace('+', '')}?text=${encodeURIComponent('Assalamu Alaikum! Heartiest congratulations to Wasim & Ameen on their auspicious wedding!')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-medium flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <MessageSquare size={11} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold tracking-wider uppercase transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
