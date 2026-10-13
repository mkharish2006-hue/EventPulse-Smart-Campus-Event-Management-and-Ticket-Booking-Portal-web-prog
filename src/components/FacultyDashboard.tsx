import React, { useState } from 'react';
import { EventItem, Booking, UserProfile, EventCategory } from '../types';
import { 
  Briefcase, 
  Plus, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Users, 
  X,
  Search,
  Check,
  Building,
  GraduationCap
} from 'lucide-react';

interface FacultyDashboardProps {
  events: EventItem[];
  bookings: Booking[];
  currentUser: UserProfile;
  onCreateEvent: (newEvent: EventItem) => void;
  onCheckInBooking: (bookingRef: string) => { success: boolean; booking?: Booking; message: string };
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  events,
  bookings,
  currentUser,
  onCreateEvent,
  onCheckInBooking,
}) => {
  const [scanInput, setScanInput] = useState<string>('');
  const [checkInResult, setCheckInResult] = useState<{ success: boolean; message: string; booking?: Booking } | null>(null);

  // Modal for creating department event
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<EventCategory>('Workshop');
  const [newDate, setNewDate] = useState<string>('2026-11-18');
  const [newTime, setNewTime] = useState<string>('10:00 AM - 04:00 PM');
  const [newVenue, setNewVenue] = useState<string>('IT Department Seminar Hall 2');
  const [newCapacity, setNewCapacity] = useState<number>(100);
  const [newBasePrice, setNewBasePrice] = useState<number>(0);
  const [newDescription, setNewDescription] = useState<string>('');

  const [eventSearch, setEventSearch] = useState<string>('');

  const handleRunCheckIn = (refToScan: string) => {
    if (!refToScan.trim()) return;
    const result = onCheckInBooking(refToScan.trim());
    setCheckInResult(result);
    if (result.success) {
      setScanInput('');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventId = `evt-fac-${Date.now()}`;
    const created: EventItem = {
      id: eventId,
      title: newTitle,
      category: newCategory,
      date: newDate,
      time: newTime,
      venue: newVenue,
      organizer: `${currentUser.department} (${currentUser.name})`,
      description: newDescription || 'Department technical workshop and faculty development program.',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      tags: ['Department Event', currentUser.department.split(' ')[0], '2026'],
      totalCapacity: newCapacity,
      bookedCount: 0,
      tiers: [
        {
          type: 'Student',
          name: 'Student Workshop Pass',
          price: newBasePrice,
          perks: ['Lab Access', 'Course Certificate', 'Study Kit'],
          availableSeats: Math.round(newCapacity * 0.8),
          totalSeats: Math.round(newCapacity * 0.8),
        },
        {
          type: 'Standard',
          name: 'Faculty / External Pass',
          price: newBasePrice + 99,
          perks: ['All Student Perks', 'Faculty Networking Lunch'],
          availableSeats: Math.round(newCapacity * 0.2),
          totalSeats: Math.round(newCapacity * 0.2),
        },
      ],
    };

    onCreateEvent(created);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.venue.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.organizer.toLowerCase().includes(eventSearch.toLowerCase())
  );

  const checkedInCount = bookings.filter((b) => b.status === 'Checked-In').length;
  const totalBookingsCount = bookings.filter((b) => b.status !== 'Cancelled').length;

  return (
    <div className="space-y-6">
      
      {/* Faculty Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-cyan-400 font-mono flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Academic Faculty Coordinator Portal · {currentUser.department}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Department Events & Gate Check-In
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Signed in as <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/30 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Propose Department Event</span>
        </button>
      </div>

      {/* KPI Stats for Faculty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Campus Events Roster</div>
          <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
            {events.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Scheduled workshops and symposiums
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Total Registered Students</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1 tabular-nums">
            {totalBookingsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across college departments
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Gate Verified Passes</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            {checkedInCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Scanned and entered into hall
          </div>
        </div>
      </div>

      {/* Gate Entry Scanner (Primary Faculty Task) */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Venue Gate Attendance Scanner</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify attendee ticket QR codes at department laboratory or hall entrance
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/60">
            Gate Prober Active
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRunCheckIn(scanInput);
            }}
            placeholder="Scan QR or type Booking Ref (e.g. EP-2026-7819)"
            className="flex-1 px-4 py-2.5 text-xs bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500 uppercase"
          />
          <button
            type="button"
            onClick={() => handleRunCheckIn(scanInput)}
            className="px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-cyan-600/30"
          >
            Verify Pass
          </button>
        </div>

        {/* Quick Sample IDs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-mono">Quick Scan Test Passes:</span>
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

        {/* Feedback result */}
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
                  <span>Student: <strong>{checkInResult.booking.userName}</strong></span>
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

      {/* Events Roster Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Department & Campus Events</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track participant enrollments and event venues</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder="Filter events..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono">
              <tr>
                <th className="px-5 py-3 font-semibold">Event Title</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Date & Time</th>
                <th className="px-5 py-3 font-semibold">Venue</th>
                <th className="px-5 py-3 font-semibold text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredEvents.map((e) => (
                <tr key={e.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-white">{e.title}</div>
                    <div className="text-[11px] text-slate-400">{e.organizer}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-cyan-400">
                    {e.category}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-slate-200">{e.date}</div>
                    <div className="text-[11px] text-slate-500">{e.time}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 truncate max-w-[200px]">
                    {e.venue}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums">
                    <strong>{e.bookedCount}</strong> / {e.totalCapacity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Department Event Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h2 className="text-base font-bold text-white">Create Department Workshop / Event</h2>
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
                  placeholder="e.g. Deep Learning & Computer Vision Workshop"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Tech">Tech</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department Venue / Lab</label>
                  <input
                    type="text"
                    required
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    placeholder="e.g. IT Department Lab 3"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Timing Schedule</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="10:00 AM - 04:00 PM"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Seat Capacity</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={500}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fee (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description & Syllabus</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline topics, faculty instructors, prerequisites, and kit distribution..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-cyan-500"
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
                  className="px-5 py-2 font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer"
                >
                  Publish Department Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
