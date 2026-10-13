import React, { useState } from 'react';
import { EventItem, Booking, UserProfile, EventCategory } from '../types';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Plus, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Trash2, 
  X,
  Search,
  Check,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

interface AdminDashboardProps {
  events: EventItem[];
  bookings: Booking[];
  currentUser: UserProfile;
  onCreateEvent: (newEvent: EventItem) => void;
  onDeleteEvent: (eventId: string) => void;
  onCheckInBooking: (bookingRef: string) => { success: boolean; booking?: Booking; message: string };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  events,
  bookings,
  currentUser,
  onCreateEvent,
  onDeleteEvent,
  onCheckInBooking,
}) => {
  // Check-in state
  const [scanInput, setScanInput] = useState<string>('');
  const [checkInResult, setCheckInResult] = useState<{ success: boolean; message: string; booking?: Booking } | null>(null);

  // Modal for creating event
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<EventCategory>('Tech');
  const [newDate, setNewDate] = useState<string>('2026-11-15');
  const [newTime, setNewTime] = useState<string>('09:30 AM - 04:30 PM');
  const [newVenue, setNewVenue] = useState<string>('Auditorium Block A');
  const [newCapacity, setNewCapacity] = useState<number>(150);
  const [newBasePrice, setNewBasePrice] = useState<number>(99);
  const [newDescription, setNewDescription] = useState<string>('');

  // Search filter for events table
  const [eventSearch, setEventSearch] = useState<string>('');

  // Compute metrics with tabular figures
  const totalBookingsCount = bookings.filter((b) => b.status !== 'Cancelled').length;
  const totalRevenue = bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCapacity = events.reduce((acc, curr) => acc + curr.totalCapacity, 0);
  const totalBookedSeats = events.reduce((acc, curr) => acc + curr.bookedCount, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalBookedSeats / totalCapacity) * 100) : 0;
  const checkedInCount = bookings.filter((b) => b.status === 'Checked-In').length;

  const handleRunCheckIn = (refToScan: string) => {
    if (!refToScan.trim()) return;
    const result = onCheckInBooking(refToScan.trim());
    setCheckInResult(result);
    if (result.success) {
      setScanInput('');
    }
  };

  const handleExportCsv = () => {
    const headers = 'Booking Ref,Event Title,Event Date,Attendee Name,Email,College,Tier,Quantity,Amount (INR),Status\n';
    const rows = bookings
      .map(
        (b) =>
          `"${b.id}","${b.eventTitle}","${b.eventDate}","${b.userName}","${b.userEmail}","${b.userCollege}","${b.tier}",${b.quantity},${b.totalAmount},"${b.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eventpulse_attendees_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventId = `evt-${Date.now()}`;
    const created: EventItem = {
      id: eventId,
      title: newTitle,
      category: newCategory,
      date: newDate,
      time: newTime,
      venue: newVenue,
      organizer: 'REC Event Management Cell',
      description: newDescription || 'Academic symposium and collegiate technical event organized by department coordinators.',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      tags: ['Campus Fest', newCategory, '2026'],
      totalCapacity: newCapacity,
      bookedCount: 0,
      tiers: [
        {
          type: 'Student',
          name: 'Student Pass',
          price: Math.max(0, newBasePrice - 50),
          perks: ['Event Access', 'Certificate'],
          availableSeats: Math.round(newCapacity * 0.7),
          totalSeats: Math.round(newCapacity * 0.7),
        },
        {
          type: 'Standard',
          name: 'General Pass',
          price: newBasePrice,
          perks: ['Event Kit', 'Lunch & Certificate'],
          availableSeats: Math.round(newCapacity * 0.3),
          totalSeats: Math.round(newCapacity * 0.3),
        },
      ],
    };

    onCreateEvent(created);
    setIsCreateOpen(false);
    // Reset form
    setNewTitle('');
    setNewDescription('');
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.venue.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.category.toLowerCase().includes(eventSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Faculty Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-amber-400 font-mono flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Console · Role: Faculty Event Chair</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Campus Event Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.department})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Strip (tabular-nums, clean single elevation) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Total Passes Sold</div>
          <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
            {totalBookingsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {events.length} active campus events
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Gross Registrations (INR)</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Net collected in college fund
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Capacity Utilization</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1 tabular-nums">
            {occupancyRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalBookedSeats} of {totalCapacity} total seats filled
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Gate Verified Attendees</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1 tabular-nums">
            {checkedInCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Live QR code scan check-ins
          </div>
        </div>

      </div>

      {/* Live QR Code Check-In Scanner Module */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Gate Entry Scanner & Attendee Verification</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates handheld barcode scanner at convention entrance (POST /api/checkin.php)
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/60">
            Scanner Ready
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunCheckIn(scanInput);
              }}
              placeholder="Scan or enter Booking Ref (e.g. EP-2026-7819)"
              className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500 uppercase"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRunCheckIn(scanInput)}
            className="px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-cyan-600/30"
          >
            Verify & Check-In
          </button>
        </div>

        {/* Quick Test Bar with existing Booking Refs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-mono">Quick Test Sample IDs:</span>
          {bookings.slice(0, 4).map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setScanInput(b.id);
                handleRunCheckIn(b.id);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono text-[11px] border border-slate-700 transition-colors cursor-pointer"
            >
              {b.id} ({b.userName.split(' ')[0]})
            </button>
          ))}
        </div>

        {/* Check-In Result Banner */}
        {checkInResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
              checkInResult.success
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/50 border-rose-800 text-rose-200'
            }`}
          >
            {checkInResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">{checkInResult.message}</div>
              {checkInResult.booking && (
                <div className="mt-1 font-mono text-[11px] text-slate-300 space-x-2">
                  <span>Attendee: <strong>{checkInResult.booking.userName}</strong></span>
                  <span>·</span>
                  <span>Event: <strong>{checkInResult.booking.eventTitle}</strong></span>
                  <span>·</span>
                  <span>Tier: <strong>{checkInResult.booking.tier}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Management Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">All Scheduled Events</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage campus listings, monitor seat counts, and modify schedules</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder="Search event title, venue..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono">
              <tr>
                <th className="px-5 py-3 font-semibold">Event Title & Category</th>
                <th className="px-5 py-3 font-semibold">Date & Time</th>
                <th className="px-5 py-3 font-semibold">Venue</th>
                <th className="px-5 py-3 font-semibold text-right">Occupancy</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredEvents.map((e) => {
                const percent = Math.round((e.bookedCount / e.totalCapacity) * 100);
                return (
                  <tr key={e.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{e.title}</div>
                      <div className="text-[11px] text-indigo-400 font-mono mt-0.5">{e.category} · ID: {e.id}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-200">{e.date}</div>
                      <div className="text-[11px] text-slate-500">{e.time}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 truncate max-w-[180px]">
                      {e.venue}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums">
                      <div>
                        <strong>{e.bookedCount}</strong> / {e.totalCapacity}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {percent}% reserved
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove event "${e.title}"? This will unpublish the listing.`)) {
                            onDeleteEvent(e.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Event Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h2 className="text-base font-bold text-white">Create New Campus Event</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AI Prompt Engineering Symposium"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Venue / Auditorium</label>
                  <input
                    type="text"
                    required
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    placeholder="e.g. Block C Auditorium"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time Schedule</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 10:00 AM - 04:00 PM"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={1000}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline topics covered, key speakers, and agenda details..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                >
                  Publish Campus Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
