import React, { useState } from 'react';
import { Booking, UserProfile } from '../types';
import { Ticket, Calendar, MapPin, QrCode, Trash2, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface MyBookingsViewProps {
  bookings: Booking[];
  currentUser: UserProfile;
  onViewTicket: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onBrowseEvents: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  currentUser,
  onViewTicket,
  onCancelBooking,
  onBrowseEvents,
}) => {
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'Checked-In' | 'Cancelled'>('All');

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'All') return true;
    return b.status === filter;
  });

  // Calculate days remaining
  const getDaysRemaining = (eventDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(eventDateStr);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-400 font-mono">
            Attendee Registration Portal · {currentUser.college}
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">My Registered Passes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        {/* Status Filter Tabs (functional segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          {(['All', 'Confirmed', 'Checked-In', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List or Empty State */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No passes found in this category</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You haven't reserved any campus event tickets under this filter yet.
            </p>
          </div>
          <button
            onClick={onBrowseEvents}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Browse Campus Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => {
            const daysLeft = getDaysRemaining(b.eventDate);
            return (
              <div
                key={b.id}
                className="flex flex-col justify-between p-5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-750 transition-all shadow-sm"
              >
                <div>
                  {/* Top Bar: Reference ID & Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-indigo-400 font-semibold">{b.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                          : b.status === 'Checked-In'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/80'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/80'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-white mt-2.5 line-clamp-1">
                    {b.eventTitle}
                  </h3>

                  {/* Schedule & Venue */}
                  <div className="mt-3 space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{b.eventDate}</span>
                      {daysLeft > 0 ? (
                        <span className="text-[11px] text-amber-400 font-mono">
                          (in {daysLeft} days)
                        </span>
                      ) : daysLeft === 0 ? (
                        <span className="text-[11px] text-emerald-400 font-mono">
                          (Today!)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          (Completed)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{b.eventVenue}</span>
                    </div>
                  </div>

                  {/* Tier & Amount Paid */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div className="text-slate-400">
                      Tier: <strong className="text-slate-200">{b.tier}</strong> ({b.quantity} pass)
                    </div>
                    <div className="text-white font-bold tabular-nums">
                      {b.totalAmount === 0 ? 'Free' : `₹${b.totalAmount.toFixed(2)}`}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewTicket(b)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/30"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Digital QR Pass</span>
                  </button>

                  {b.status === 'Confirmed' && (
                    <button
                      onClick={() => {
                        if (confirm(`Cancel booking ${b.id}? Seats will be released back to the event.`)) {
                          onCancelBooking(b.id);
                        }
                      }}
                      className="px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
