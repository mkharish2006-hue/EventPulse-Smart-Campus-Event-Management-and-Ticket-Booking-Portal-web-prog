import React from 'react';
import { EventItem } from '../types';
import { X, Calendar, MapPin, Users, Ticket, Check, ShieldCheck } from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onBookNow: (event: EventItem) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onBookNow,
}) => {
  if (!event) return null;

  const lowestPrice = Math.min(...event.tiers.map((t) => t.price));
  const capacityPercent = Math.min(
    100,
    Math.round((event.bookedCount / event.totalCapacity) * 100)
  );
  const isSoldOut = event.bookedCount >= event.totalCapacity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Banner with Close button */}
        <div className="relative aspect-[16/9] w-full bg-slate-800">
          <img
            src={event.imageUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
              <span>{event.category}</span>
              <span>·</span>
              <span>{event.date}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Key Meta Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="space-y-1">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Date & Timing</span>
              </div>
              <div className="font-semibold text-white">{event.date}</div>
              <div className="text-[11px] text-slate-400">{event.time}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Venue & Host</span>
              </div>
              <div className="font-semibold text-white truncate">{event.venue}</div>
              <div className="text-[11px] text-slate-400 truncate">{event.organizer}</div>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              About This Event
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {event.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-slate-950 text-indigo-300 border border-slate-800">
                #{tag}
              </span>
            ))}
          </div>

          {/* Ticket Tiers Available */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Available Admission Tiers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {event.tiers.map((tier) => (
                <div
                  key={tier.type}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{tier.name}</span>
                  </div>
                  <div className="text-base font-bold text-indigo-400 font-mono tabular-nums">
                    {tier.price === 0 ? 'Free' : `₹${tier.price}`}
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    {tier.perks.map((p, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-850">
                    {tier.availableSeats} of {tier.totalSeats} seats remaining
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Total Bookings</div>
              <div className="text-sm font-bold text-white font-mono tabular-nums">
                {event.bookedCount} / {event.totalCapacity} ({capacityPercent}% filled)
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onBookNow(event);
                }}
                disabled={isSoldOut}
                className={`px-5 py-2.5 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSoldOut
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>{isSoldOut ? 'Sold Out' : 'Proceed to Booking'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
