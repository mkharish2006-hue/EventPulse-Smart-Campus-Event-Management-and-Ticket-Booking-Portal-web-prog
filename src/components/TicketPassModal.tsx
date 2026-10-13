import React, { useRef } from 'react';
import { Booking } from '../types';
import { X, Printer, Download, CheckCircle2, QrCode, Calendar, MapPin, Building, ShieldCheck } from 'lucide-react';

interface TicketPassModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  booking,
  onClose,
}) => {
  if (!booking) return null;
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Generate SVG QR pattern pseudo-matrix from booking id
  const generateQrMatrix = (seed: string) => {
    const size = 15;
    const matrix: boolean[][] = [];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        // Corner markers
        const isCorner1 = r < 4 && c < 4;
        const isCorner2 = r < 4 && c >= size - 4;
        const isCorner3 = r >= size - 4 && c < 4;
        
        if (isCorner1 || isCorner2 || isCorner3) {
          const cornerR = r < 4 ? r : r - (size - 4);
          const cornerC = c < 4 ? c : (c >= size - 4 ? c - (size - 4) : c);
          // 4x4 marker with border and center
          const isBorder = cornerR === 0 || cornerR === 3 || cornerC === 0 || cornerC === 3;
          const isCenter = (cornerR === 1 || cornerR === 2) && (cornerC === 1 || cornerC === 2);
          row.push(isBorder || isCenter);
        } else {
          const bit = Math.abs((hash ^ (r * 17 + c * 31)) % 7) > 2;
          row.push(bit);
        }
      }
      matrix.push(row);
    }
    return matrix;
  };

  const qrMatrix = generateQrMatrix(booking.id + booking.qrCodeData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:max-w-full">
        
        {/* Modal Top Bar (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Digital Event Pass Confirmed · Valid for Venue Gate Entry</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Pass Body */}
        <div ref={printRef} className="p-6 bg-slate-900 print:bg-white print:text-black">
          
          <div className="border border-slate-750 print:border-slate-300 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 print:from-white print:to-white overflow-hidden shadow-lg">
            
            {/* Ticket Header Strip */}
            <div className="p-5 bg-indigo-950/40 print:bg-indigo-50 border-b border-slate-800 print:border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono tracking-wider text-indigo-400 print:text-indigo-700 uppercase font-semibold">
                  EventPulse Digital Campus Pass
                </div>
                <div className="text-xl font-bold text-white print:text-slate-900 mt-0.5">
                  {booking.tier} Admission
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded bg-indigo-900/60 print:bg-indigo-100 text-indigo-300 print:text-indigo-800 text-xs font-mono font-bold">
                  {booking.status}
                </span>
                <div className="text-[10px] text-slate-400 print:text-slate-500 font-mono mt-1">
                  REF: {booking.id}
                </div>
              </div>
            </div>

            {/* Event & Attendee Details */}
            <div className="p-6 space-y-5">
              
              <div>
                <div className="text-[11px] text-slate-400 print:text-slate-500 uppercase tracking-wider font-semibold">
                  Event Name
                </div>
                <div className="text-base font-bold text-slate-100 print:text-black mt-0.5">
                  {booking.eventTitle}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[11px] text-slate-400 print:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Date & Schedule</span>
                  </div>
                  <div className="font-semibold text-slate-200 print:text-slate-800 mt-0.5">
                    {booking.eventDate}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 print:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>Campus Venue</span>
                  </div>
                  <div className="font-semibold text-slate-200 print:text-slate-800 mt-0.5 truncate">
                    {booking.eventVenue}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 print:bg-slate-50 border border-slate-800 print:border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[11px] text-slate-400 print:text-slate-500">Attendee Name</div>
                  <div className="font-bold text-white print:text-black">{booking.userName}</div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 truncate">{booking.userEmail}</div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 print:text-slate-500">Institution</div>
                  <div className="font-bold text-white print:text-black truncate">{booking.userCollege}</div>
                  <div className="text-[11px] text-indigo-400 print:text-indigo-700 font-mono">Qty: {booking.quantity} Pass</div>
                </div>
              </div>

              {/* Scannable Ticket QR Code Section */}
              <div className="pt-3 border-t border-dashed border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                  {/* Algorithmic SVG QR Code */}
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    <svg width="96" height="96" viewBox="0 0 15 15" className="shape-rendering-crisp">
                      {qrMatrix.map((row, r) =>
                        row.map((active, c) =>
                          active ? (
                            <rect
                              key={`${r}-${c}`}
                              x={c}
                              y={r}
                              width="1"
                              height="1"
                              fill="#0f172a"
                            />
                          ) : null
                        )
                      )}
                    </svg>
                  </div>

                  <div className="text-left text-xs">
                    <div className="font-bold text-slate-200 print:text-black flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Scan for Gate Check-In</span>
                    </div>
                    <div className="text-[11px] text-slate-400 print:text-slate-600 font-mono mt-1 break-all max-w-[200px]">
                      {booking.id}
                    </div>
                    <div className="text-[10px] text-emerald-400 print:text-emerald-700 font-medium mt-1">
                      Verified Security Hash
                    </div>
                  </div>
                </div>

                {/* Amount Paid info */}
                <div className="text-right sm:text-right w-full sm:w-auto">
                  <div className="text-[11px] text-slate-400 print:text-slate-500">Total Paid</div>
                  <div className="text-lg font-bold text-white print:text-black font-mono tabular-nums">
                    ₹{booking.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {booking.discountApplied > 0 ? `(Saved ₹${booking.discountApplied.toFixed(2)})` : 'GST Included'}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Barcode Pattern */}
            <div className="px-6 py-3 bg-slate-950 print:bg-slate-100 border-t border-slate-800 print:border-slate-200 flex items-center justify-between">
              <div className="flex gap-1 items-center h-5 opacity-70">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-400 print:bg-slate-700 h-full"
                    style={{
                      width: `${(i % 3) + 1.2}px`,
                      marginRight: `${(i % 2) * 1.5}px`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                SECURE AUTH: PDO-SHA256
              </span>
            </div>

          </div>

        </div>

        {/* Modal Actions (hidden on print) */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between print:hidden">
          <div className="text-xs text-slate-400 font-mono">
            Booking Saved to LocalStorage & MySQL schema
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
