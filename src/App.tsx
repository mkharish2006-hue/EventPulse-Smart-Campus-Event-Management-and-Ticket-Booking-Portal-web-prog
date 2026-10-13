import React, { useState, useEffect } from 'react';
import { 
  EventItem, 
  Booking, 
  UserProfile, 
  EventCategory 
} from './types';
import { 
  INITIAL_EVENTS, 
  INITIAL_BOOKINGS, 
  DEFAULT_USERS 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { BookingModal } from './components/BookingModal';
import { TicketPassModal } from './components/TicketPassModal';
import { EventDetailModal } from './components/EventDetailModal';
import { MyBookingsView } from './components/MyBookingsView';
import { AdminDashboard } from './components/AdminDashboard';
import { FacultyDashboard } from './components/FacultyDashboard';
import { PhpApiWorkbench } from './components/PhpApiWorkbench';
import { VivaStudyCenter } from './components/VivaStudyCenter';
import { AuthModal } from './components/AuthModal';
import { 
  Search, 
  Filter, 
  Ticket, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Code2, 
  Layers, 
  Sparkles,
  ArrowRight,
  User,
  Shield,
  Briefcase,
  GraduationCap
} from 'lucide-react';

export default function App() {
  // Persistent Users store
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('eventpulse_users_v2');
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  // Persistent Events state
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem('eventpulse_events_v2');
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  // Persistent Bookings state
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('eventpulse_bookings_v2');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  // Current logged in user (Defaults to Harish M student)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('eventpulse_active_user_v2');
      if (saved) return JSON.parse(saved);
      return DEFAULT_USERS[2]; // Harish M
    } catch {
      return DEFAULT_USERS[2];
    }
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'events' | 'my-bookings' | 'admin' | 'faculty' | 'api-lab' | 'viva-report'>('events');

  // Search & Category Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<EventItem | null>(null);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<EventItem | null>(null);
  const [activeTicketPass, setActiveTicketPass] = useState<Booking | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.setItem('eventpulse_users_v2', JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('eventpulse_active_user_v2', JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('eventpulse_events_v2', JSON.stringify(events));
    } catch {}
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem('eventpulse_bookings_v2', JSON.stringify(bookings));
    } catch {}
  }, [bookings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth: Log In
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin');
      showToast(`Signed in as Administrator: ${user.name}`);
    } else if (user.role === 'faculty') {
      setActiveTab('faculty');
      showToast(`Signed in as Faculty Coordinator: ${user.name}`);
    } else {
      setActiveTab('events');
      showToast(`Signed in as Student: ${user.name}`);
    }
  };

  // Auth: Register New Account
  const handleRegister = (newUser: UserProfile) => {
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    if (newUser.role === 'faculty') {
      setActiveTab('faculty');
    } else {
      setActiveTab('events');
    }
    showToast(`Account created successfully! Welcome, ${newUser.name}`);
  };

  // Auth: Sign Out
  const handleSignOut = () => {
    // Revert to Harish default student or open auth modal
    const defaultStudent = users.find((u) => u.username === 'harish') || DEFAULT_USERS[2];
    setCurrentUser(defaultStudent);
    setActiveTab('events');
    showToast('Signed out. Switched to Student demo view.');
  };

  // Booking completion handler
  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);

    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === newBooking.eventId) {
          const updatedTiers = evt.tiers.map((t) => {
            if (t.type === newBooking.tier) {
              return {
                ...t,
                availableSeats: Math.max(0, t.availableSeats - newBooking.quantity),
              };
            }
            return t;
          });
          return {
            ...evt,
            bookedCount: evt.bookedCount + newBooking.quantity,
            tiers: updatedTiers,
          };
        }
        return evt;
      })
    );

    setSelectedEventForBooking(null);
    setActiveTicketPass(newBooking);
    showToast(`Pass confirmed: Ref ${newBooking.id}`);
  };

  // Cancel booking handler
  const handleCancelBooking = (bookingId: string) => {
    const bookingToCancel = bookings.find((b) => b.id === bookingId);
    if (!bookingToCancel) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );

    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === bookingToCancel.eventId) {
          const updatedTiers = evt.tiers.map((t) => {
            if (t.type === bookingToCancel.tier) {
              return {
                ...t,
                availableSeats: Math.min(t.totalSeats, t.availableSeats + bookingToCancel.quantity),
              };
            }
            return t;
          });
          return {
            ...evt,
            bookedCount: Math.max(0, evt.bookedCount - bookingToCancel.quantity),
            tiers: updatedTiers,
          };
        }
        return evt;
      })
    );

    showToast(`Booking ${bookingId} has been cancelled`);
  };

  // Admin/Faculty: Create Event
  const handleCreateEvent = (newEvent: EventItem) => {
    setEvents((prev) => [newEvent, ...prev]);
    showToast(`Event published: "${newEvent.title}"`);
  };

  // Admin: Delete Event
  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    showToast('Event removed from campus catalog');
  };

  // Gate Check-in verification
  const handleCheckInBooking = (bookingRef: string) => {
    const targetBooking = bookings.find(
      (b) => b.id.toLowerCase() === bookingRef.toLowerCase()
    );

    if (!targetBooking) {
      return {
        success: false,
        message: `Booking reference "${bookingRef}" not found in database records.`,
      };
    }

    if (targetBooking.status === 'Checked-In') {
      return {
        success: false,
        booking: targetBooking,
        message: `Attendee ${targetBooking.userName} was already checked in earlier.`,
      };
    }

    if (targetBooking.status === 'Cancelled') {
      return {
        success: false,
        booking: targetBooking,
        message: `Denied: Ticket ${bookingRef} was previously cancelled.`,
      };
    }

    const updated = { ...targetBooking, status: 'Checked-In' as const };
    setBookings((prev) =>
      prev.map((b) => (b.id === targetBooking.id ? updated : b))
    );

    showToast(`Gate Verified: ${targetBooking.userName} (${targetBooking.id}) checked in`);

    return {
      success: true,
      booking: updated,
      message: `Access Granted: ${targetBooking.userName} verified for "${targetBooking.eventTitle}".`,
    };
  };

  // Filter events for attendee catalog
  const filteredEvents = events.filter((e) => {
    const matchesCategory =
      selectedCategory === 'All' || e.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      e.title.toLowerCase().includes(query) ||
      e.venue.toLowerCase().includes(query) ||
      e.tags.some((t) => t.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const attendeeBookings = bookings.filter((b) => b.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        bookingsCount={attendeeBookings.filter((b) => b.status === 'Confirmed').length}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white shadow-2xl animate-fade-in font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: Campus Events Catalog & Discovery */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            
            {/* Hero Section */}
            <section className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 sm:p-10">
              
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl space-y-4">
                
                {/* Unboxed Meta Lead */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-400 font-mono font-semibold">
                  <span>Rajalakshmi Engineering College</span>
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <span>IT3511 Web Programming Project</span>
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <span>Student: Harish M (2024-IT)</span>
                </div>

                {/* Hero Headline */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Smart Campus Event Management & Digital Ticket Booking
                </h1>

                {/* Hero Subtitle */}
                <p className="text-sm text-slate-300 leading-relaxed">
                  Discover collegiate hackathons, technical symposiums, and cultural festivals. 
                  Reserve seats with instant digital SVG QR passes, atomic transaction protection, and student discount verification.
                </p>

                {/* Active Login Role Banner */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Current Session:</span>
                    <strong className="text-white">{currentUser.name}</strong>
                    <span className="font-mono text-[11px] text-indigo-400">
                      ({currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'faculty' ? 'Faculty' : 'Student'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline cursor-pointer"
                    >
                      Switch Persona or Register
                    </button>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search hackathons, workshops, symposiums, venues..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/90 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
                    />
                  </div>

                  <button
                    onClick={() => setActiveTab('my-bookings')}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 cursor-pointer whitespace-nowrap"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>My Registered Passes</span>
                  </button>
                </div>

                {/* Category Filter Tabs */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono mr-1">Filter by:</span>
                  {['All', 'Tech', 'Workshop', 'Cultural', 'Sports'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-slate-100 text-slate-950 shadow-sm'
                          : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat === 'All' ? 'All Events' : cat}
                    </button>
                  ))}
                </div>

              </div>

            </section>

            {/* Event Cards Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Upcoming Campus Events</h2>
                  <p className="text-xs text-slate-400">
                    Showing <strong className="text-slate-200">{filteredEvents.length}</strong> listings
                    {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                  </p>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="text-xs text-indigo-400 hover:underline cursor-pointer"
                  >
                    Clear search filters
                  </button>
                )}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 space-y-3">
                  <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                  <h3 className="text-base font-semibold text-white">No matching events found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try adjusting your search terms or selecting another category filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      onSelectEvent={(e) => setSelectedEventForDetails(e)}
                      onBookNow={(e) => setSelectedEventForBooking(e)}
                    />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}

        {/* VIEW 2: My Bookings View */}
        {activeTab === 'my-bookings' && (
          <MyBookingsView
            bookings={attendeeBookings}
            currentUser={currentUser}
            onViewTicket={(b) => setActiveTicketPass(b)}
            onCancelBooking={handleCancelBooking}
            onBrowseEvents={() => setActiveTab('events')}
          />
        )}

        {/* VIEW 3: Administrator Dashboard (Admin Role Only) */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <AdminDashboard
            events={events}
            bookings={bookings}
            currentUser={currentUser}
            onCreateEvent={handleCreateEvent}
            onDeleteEvent={handleDeleteEvent}
            onCheckInBooking={handleCheckInBooking}
          />
        )}

        {/* VIEW 4: Faculty Coordinator Portal (Faculty Role Only) */}
        {activeTab === 'faculty' && currentUser.role === 'faculty' && (
          <FacultyDashboard
            events={events}
            bookings={bookings}
            currentUser={currentUser}
            onCreateEvent={handleCreateEvent}
            onCheckInBooking={handleCheckInBooking}
          />
        )}

        {/* VIEW 5: PHP & API Lab Workbench */}
        {activeTab === 'api-lab' && <PhpApiWorkbench />}

        {/* VIEW 6: Viva Prep & Academic Report */}
        {activeTab === 'viva-report' && <VivaStudyCenter />}

      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <BookingModal
        event={selectedEventForBooking}
        currentUser={currentUser}
        onClose={() => setSelectedEventForBooking(null)}
        onBookingSuccess={handleBookingSuccess}
      />

      <TicketPassModal
        booking={activeTicketPass}
        onClose={() => setActiveTicketPass(null)}
      />

      <EventDetailModal
        event={selectedEventForDetails}
        onClose={() => setSelectedEventForDetails(null)}
        onBookNow={(e) => setSelectedEventForBooking(e)}
      />

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">EventPulse</span>
            <span aria-hidden="true">·</span>
            <span>Web Programming Laboratory Project (IT3511)</span>
            <span aria-hidden="true">·</span>
            <span>Rajalakshmi Engineering College</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Student: Harish M (2024-IT-048)</span>
            <span aria-hidden="true">·</span>
            <span>Roles: Admin, Faculty, Student</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
