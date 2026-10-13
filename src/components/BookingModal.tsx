import React, { useState } from 'react';
import { EventItem, TicketTierType, Booking, UserProfile } from '../types';
import { X, Check, Ticket, Tag, Calendar, MapPin, AlertCircle, ShieldCheck } from 'lucide-react';

interface BookingModalProps {
  event: EventItem | null;
  onClose: () => void;
  currentUser: UserProfile;
  onBookingSuccess: (newBooking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  event,
  onClose,
  currentUser,
  onBookingSuccess,
}) => {
  if (!event) return null;

  const [selectedTier, setSelectedTier] = useState<TicketTierType>('Student');
  const [quantity, setQuantity] = useState<number>(1);
  const [couponCode, setCouponCode] = useState<string>('REC2024');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('REC2024 applied (25% Student Discount)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form fields
  const [name, setName] = useState<string>(currentUser.name);
  const [email, setEmail] = useState<string>(currentUser.email);
  const [college, setCollege] = useState<string>(currentUser.college);
  const [rollNo, setRollNo] = useState<string>('2024-IT-048');

  // Selected tier data
  const tierData = event.tiers.find((t) => t.type === selectedTier) || event.tiers[0];
  const unitPrice = tierData.price;
  const subtotal = unitPrice * quantity;

  // Calculate discount
  const calculateDiscount = (code: string, currentSubtotal: number) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'REC2024') {
      const disc = Math.round(currentSubtotal * 0.25 * 100) / 100;
      setAppliedDiscount(disc);
      setCouponMessage('Valid: 25% Rajalakshmi Student Discount applied!');
    } else if (cleanCode === 'DEVCON') {
      const disc = Math.min(currentSubtotal, 50 * quantity);
      setAppliedDiscount(disc);
      setCouponMessage('Valid: ₹50/ticket DevCon promo applied!');
    } else if (cleanCode === '') {
      setAppliedDiscount(0);
      setCouponMessage('');
    } else {
      setAppliedDiscount(0);
      setCouponMessage('Invalid or expired coupon code');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    calculateDiscount(couponCode, subtotal);
  };

  const totalAmount = Math.max(0, subtotal - appliedDiscount);

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate PHP backend execution latency
    setTimeout(() => {
      const bookingRef = `EP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const qrData = `EVENTPULSE:${bookingRef}:${event.id}:${currentUser.id}:CONFIRMED`;

      const newBooking: Booking = {
        id: bookingRef,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue,
        userId: currentUser.id,
        userName: name,
        userEmail: email,
        userCollege: college,
        tier: selectedTier,
        quantity,
        unitPrice,
        discountApplied: appliedDiscount,
        totalAmount,
        bookingTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        qrCodeData: qrData,
        status: 'Confirmed',
      };

      setIsSubmitting(false);
      onBookingSuccess(newBooking);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="text-xs font-semibold text-indigo-400 font-mono flex items-center gap-2">
              <Ticket className="w-3.5 h-3.5" />
              <span>POST /api/bookings.php · Transaction Engine</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">Book Event Passes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmitBooking} className="p-6 space-y-6">
          
          {/* Event Quick Info Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-850 flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-800">
              <img
                src={event.imageUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white truncate">{event.title}</h4>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {event.date}
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {event.venue}
                </span>
              </div>
            </div>
          </div>

          {/* 1. Select Ticket Tier */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Choose Ticket Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {event.tiers.map((tier) => {
                const isSelected = selectedTier === tier.type;
                const isAvailable = tier.availableSeats > 0;
                return (
                  <button
                    key={tier.type}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedTier(tier.type);
                      calculateDiscount(couponCode, tier.price * quantity);
                    }}
                    className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500'
                        : isAvailable
                        ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/70'
                        : 'border-slate-850 bg-slate-950/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tier.name}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 text-base font-bold text-white font-mono tabular-nums">
                      {tier.price === 0 ? 'Free' : `₹${tier.price}`}
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                      {tier.perks.slice(0, 2).map((perk, idx) => (
                        <div key={idx} className="truncate">✓ {perk}</div>
                      ))}
                    </div>

                    <div className="mt-3 text-[10px] text-slate-500 font-mono">
                      {tier.availableSeats} of {tier.totalSeats} seats left
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Quantity & Attendee Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                2. Number of Passes
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newQ = Math.max(1, quantity - 1);
                    setQuantity(newQ);
                    calculateDiscount(couponCode, unitPrice * newQ);
                  }}
                  className="w-10 h-10 rounded-lg border border-slate-750 bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="text-lg font-bold text-white font-mono w-10 text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newQ = Math.min(5, quantity + 1);
                    setQuantity(newQ);
                    calculateDiscount(couponCode, unitPrice * newQ);
                  }}
                  className="w-10 h-10 rounded-lg border border-slate-750 bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  +
                </button>
                <span className="text-xs text-slate-400 font-mono">(Max 5 per student)</span>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Student Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. REC2024"
                  className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className={`mt-1 text-[11px] ${
                  appliedDiscount > 0 ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {couponMessage}
                </p>
              )}
            </div>
          </div>

          {/* 3. Attendee Personal Information */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              3. Attendee Registration Details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-slate-400 mb-1">Full Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 mb-1">College Email ID</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 mb-1">College / Institution</span>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 mb-1">Student Roll No / ID</span>
                <input
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Price Breakdown Matrix */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>{quantity}x {tierData.name} (@ ₹{unitPrice})</span>
              <span className="text-white tabular-nums">₹{subtotal.toFixed(2)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount Applied ({couponCode.toUpperCase()})</span>
                <span className="tabular-nums">-₹{appliedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Platform Fee & GST</span>
              <span className="text-emerald-400">₹0.00 (Waived)</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
              <span>Total Payable</span>
              <span className="text-indigo-400 tabular-nums">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Digital QR Pass Generated</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                {isSubmitting ? 'Processing PDO Transaction...' : `Confirm & Generate Ticket (₹${totalAmount.toFixed(2)})`}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
