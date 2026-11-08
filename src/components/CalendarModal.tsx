import { Calendar, Clock, MapPin, Download, ExternalLink, X } from 'lucide-react';

interface CalendarModalProps {
  onClose: () => void;
}

const WEDDING_EVENTS = [
  {
    title: 'Nikah Ceremony - Wasim & Ameen',
    dateLabel: 'Wednesday, 18th Nov 2026',
    timeLabel: 'After Namaz Zohar (1:30 PM)',
    venue: 'Udaipur, Rajasthan',
    startISO: '20261118T080000Z', // UTC approx for 1:30 PM IST (UTC+5:30)
    endISO: '20261118T123000Z',
    description: 'Auspicious Nikah Ceremony of Wasim & Ameen',
  },
  {
    title: 'Wedding Reception & Dinner',
    dateLabel: 'Monday, 23rd Nov 2026',
    timeLabel: '7:00 PM Onwards',
    venue: 'RAZA BAGH, MG College Road, Near Alipur Masjid, Udaipur',
    startISO: '20261123T133000Z',
    endISO: '20261123T173000Z',
    description: 'Reception & Dinner celebrating the wedding of Wasim & Ameen at Raza Bagh Udaipur',
  },
  {
    title: 'Baraat Departure to Ahmedabad',
    dateLabel: 'Tuesday, 17th Nov 2026',
    timeLabel: '9:00 AM Departure',
    venue: 'Residence: 2, Cement Gali, Dholi Bawari, Udaipur to Ahmedabad',
    startISO: '20261117T033000Z',
    endISO: '20261117T083000Z',
    description: 'Baraat Departure from Udaipur Residence to Ahmedabad',
  },
  {
    title: 'Rasm-e-Haldi & Mehfil-e-Milad',
    dateLabel: 'Monday, 16th Nov 2026',
    timeLabel: 'Haldi at 2:00 PM · Milad After Namaz Isha',
    venue: 'At Residence: 2, Cement Gali, Dholi Bawari, Udaipur',
    startISO: '20261116T083000Z',
    endISO: '20261116T163000Z',
    description: 'Rasm-e-Haldi (2:00 PM) & Mehfil-e-Milad (After Isha) at Residence',
  },
];

export default function CalendarModal({ onClose }: CalendarModalProps) {
  const getGoogleCalendarUrl = (ev: typeof WEDDING_EVENTS[0]) => {
    const text = encodeURIComponent(ev.title);
    const dates = `${ev.startISO}/${ev.endISO}`;
    const location = encodeURIComponent(ev.venue);
    const details = encodeURIComponent(ev.description);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  };

  const downloadICS = (ev: typeof WEDDING_EVENTS[0]) => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wasim and Ameen Wedding//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.description}`,
      `LOCATION:${ev.venue}`,
      `DTSTART:${ev.startISO}`,
      `DTEND:${ev.endISO}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ev.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-lg text-[#faedd0]">
                Save Wedding Dates
              </h3>
              <p className="text-xs text-[#d4af37]">
                Add to your Apple or Google Calendar
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

        {/* Events list */}
        <div className="space-y-4 my-4">
          {WEDDING_EVENTS.map((ev, index) => (
            <div 
              key={index}
              className="p-3.5 rounded-xl bg-[#320410] border border-[#d4af37]/25 shadow-sm"
            >
              <h4 className="font-semibold text-sm text-[#faedd0]">
                {ev.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-[#d4af37] mt-1.5 font-medium">
                <Calendar size={14} className="shrink-0" />
                <span>{ev.dateLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#e6ca85] mt-1">
                <Clock size={14} className="shrink-0" />
                <span>{ev.timeLabel}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-neutral-300 mt-1">
                <MapPin size={14} className="shrink-0 mt-0.5 text-[#d4af37]" />
                <span className="line-clamp-2">{ev.venue}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#d4af37]/15">
                <button
                  onClick={() => downloadICS(ev)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#50081a] hover:bg-[#680b22] text-[#faedd0] border border-[#d4af37]/30 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Download size={13} className="text-[#ffd700]" />
                  <span>Apple / iCal</span>
                </button>
                <a
                  href={getGoogleCalendarUrl(ev)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#8c122e] hover:bg-[#a61738] text-[#faedd0] text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <ExternalLink size={13} className="text-[#ffd700]" />
                  <span>Google Cal</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold tracking-wider uppercase transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
