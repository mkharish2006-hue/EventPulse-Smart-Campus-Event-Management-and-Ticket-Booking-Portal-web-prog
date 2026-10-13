import React from 'react';
import { EventItem } from '../types';
import { Calendar, MapPin, Users, Ticket, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  onSelectEvent: (event: EventItem) => void;
  onBookNow: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelectEvent,
  onBookNow,
}) => {
  const lowestPrice = Math.min(...event.tiers.map((t) => t.price));
  const capacityPercent = Math.min(
    100,
    Math.round((event.bookedCount / event.totalCapacity) * 100)
  );
  const isSoldOut = event.bookedCount >= event.totalCapacity;
  const isFillingFast = capacityPercent >= 80 && !isSoldOut;

  // Format date cleanly
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="group relative flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700/80 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md hover:shadow-black/40">
      
      {/* Event Banner Image with Aspect Ratio & Fallback */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-800/80">
        <img
          src={event.imageUrl}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
          onError={(e) => {
            // High-fidelity fallback
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Subtle Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Top Unboxed Metadata Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-750">
            <span className="font-semibold text-indigo-300">{event.category}</span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-slate-300">{formattedDate}</span>
          </div>

          {isSoldOut ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-800">
              Sold Out
            </span>
          ) : isFillingFast ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800">
              Filling Fast ({capacityPercent}%)
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex flex-col flex-1 p-5">
        
        {/* Title */}
        <h3 
          onClick={() => onSelectEvent(event)}
          className="text-base font-semibold text-slate-100 hover:text-indigo-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
        >
          {event.title}
        </h3>

        {/* Quiet Meta Line: Venue & Time */}
        <div className="mt-2.5 space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Capacity Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1.5">
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-slate-500" />
              <span>Capacity</span>
            </span>
            <span className="tabular-nums">
              <strong className="text-slate-200">{event.bookedCount}</strong> / {event.totalCapacity} ({capacityPercent}%)
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                capacityPercent >= 90
                  ? 'bg-rose-500'
                  : capacityPercent >= 70
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>

        {/* Footer: Price & Action */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Starts from</div>
            <div className="text-base font-bold text-white font-mono tabular-nums">
              {lowestPrice === 0 ? (
                <span className="text-emerald-400">Free Entry</span>
              ) : (
                <>₹{lowestPrice} <span className="text-xs font-normal text-slate-400">/ pass</span></>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectEvent(event)}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              Details
            </button>
            <button
              onClick={() => onBookNow(event)}
              disabled={isSoldOut}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                isSoldOut
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              {isSoldOut ? 'Sold Out' : 'Book Ticket'}
            </button>
          </div>
        </div>

      </div>
    </article>
  );
};
