import React, { useState } from 'react';
import { PHP_ENDPOINTS, PHP_CODE_TEMPLATES } from '../data/phpCodeTemplates';
import { PhpEndpoint } from '../types';
import { 
  Code2, 
  Terminal, 
  Database, 
  Send, 
  Copy, 
  Check, 
  Layers, 
  Server, 
  FileCode, 
  Clock, 
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const PhpApiWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api-tester' | 'php-code' | 'architecture'>('api-tester');
  
  // API Tester state
  const [selectedEndpoint, setSelectedEndpoint] = useState<PhpEndpoint>(PHP_ENDPOINTS[0]);
  const [requestPayload, setRequestPayload] = useState<string>(
    JSON.stringify(PHP_ENDPOINTS[0].samplePayload || {}, null, 2)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<any>(PHP_ENDPOINTS[0].mockResponse);
  const [responseStatusCode, setResponseStatusCode] = useState<number>(200);
  const [executionTime, setExecutionTime] = useState<number>(14.2);

  // PHP Code Viewer state
  const [selectedPhpFile, setSelectedPhpFile] = useState<keyof typeof PHP_CODE_TEMPLATES>('database.php');
  const [copiedFile, setCopiedFile] = useState<boolean>(false);

  const handleSelectEndpoint = (ep: PhpEndpoint) => {
    setSelectedEndpoint(ep);
    setRequestPayload(JSON.stringify(ep.samplePayload || {}, null, 2));
    setResponseOutput(ep.mockResponse);
    setResponseStatusCode(ep.method === 'POST' && ep.mockResponse.http_code ? ep.mockResponse.http_code : 200);
  };

  const handleExecuteRequest = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setExecutionTime(Number((8 + Math.random() * 12).toFixed(1)));
      
      let parsed = {};
      try {
        parsed = JSON.parse(requestPayload);
      } catch (err) {
        // syntax error
      }

      if (selectedEndpoint.id === 'ep-post-booking') {
        setResponseStatusCode(201);
        setResponseOutput({
          status: 'success',
          message: 'Ticket booked successfully via PDO transaction',
          bookingRef: `EP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          qrCodeData: `EVENTPULSE:EP-2026-LIVE:${Date.now()}:CONFIRMED`,
          totalPaid: (parsed as any).unitPrice || 99.0,
          server_timestamp: new Date().toISOString(),
          http_code: 201,
        });
      } else if (selectedEndpoint.id === 'ep-post-checkin') {
        setResponseStatusCode(200);
        setResponseOutput({
          status: 'success',
          message: 'Attendee verified & checked in at venue gate',
          scannedRef: (parsed as any).bookingRef || 'EP-2026-7819',
          timestamp: new Date().toISOString(),
          gateStatus: 'GREEN_PASSED',
        });
      } else {
        setResponseStatusCode(200);
        setResponseOutput(selectedEndpoint.mockResponse);
      }
    }, 450);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PHP_CODE_TEMPLATES[selectedPhpFile]);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-cyan-400 font-mono flex items-center gap-2">
            <Server className="w-3.5 h-3.5" />
            <span>Full-Stack Middle Tier · PHP 8.4 REST API & MySQL Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">PHP Backend & API Explorer</h1>
          <p className="text-xs text-slate-400 mt-1">
            Examine production-grade PHP scripts, test endpoints live, and verify SQL injection defense.
          </p>
        </div>

        {/* View Switcher Tabs (Segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('api-tester')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'api-tester'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API Tester</span>
          </button>

          <button
            onClick={() => setActiveTab('php-code')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'php-code'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>PHP & SQL Scripts</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture & ERD</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive API Tester */}
      {activeTab === 'api-tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Endpoint Directory */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              REST Endpoints (api/*.php)
            </h3>
            
            <div className="space-y-2">
              {PHP_ENDPOINTS.map((ep) => {
                const isSelected = selectedEndpoint.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/50'
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          ep.method === 'GET'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                            : ep.method === 'POST'
                            ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/80'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/80'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="text-slate-400 text-[11px] truncate">{ep.phpFile}</span>
                    </div>

                    <div className="text-xs font-semibold text-white mt-2 truncate">
                      {ep.name}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                      {ep.endpoint}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs space-y-2 text-slate-400">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Security Enforcement in PHP</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All incoming request parameters are sanitized via <code>htmlspecialchars()</code> and bound using <code>PDO::PARAM_*</code> types to stop SQL Injection and XSS attacks.
              </p>
            </div>
          </div>

          {/* Right Column: Request Runner & Response Viewer */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Request Configuration Bar */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Request Workbench</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Target: <strong className="text-slate-200">{selectedEndpoint.phpFile}</strong>
                </div>
              </div>

              {/* Endpoint URL row */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-2 rounded-lg text-xs font-mono font-bold ${
                    selectedEndpoint.method === 'GET'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <input
                  type="text"
                  readOnly
                  value={selectedEndpoint.endpoint}
                  className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                />
                <button
                  onClick={handleExecuteRequest}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/30 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Executing...' : 'Send Request'}</span>
                </button>
              </div>

              {/* Payload Editor for POST/PUT */}
              {selectedEndpoint.method !== 'GET' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Request Body (application/json)
                  </label>
                  <textarea
                    rows={5}
                    value={requestPayload}
                    onChange={(e) => setRequestPayload(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>

            {/* Live Response Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-300">HTTP Response</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      responseStatusCode >= 200 && responseStatusCode < 300
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {responseStatusCode} {responseStatusCode === 201 ? 'Created' : 'OK'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{executionTime} ms</span>
                  </span>
                  <span>Apache/2.4 · PHP 8.4</span>
                </div>
              </div>

              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                  {JSON.stringify(responseOutput, null, 2)}
                </pre>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: PHP & SQL Scripts Viewer */}
      {activeTab === 'php-code' && (
        <div className="space-y-4">
          
          {/* File Picker row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(PHP_CODE_TEMPLATES) as Array<keyof typeof PHP_CODE_TEMPLATES>).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setSelectedPhpFile(fileName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedPhpFile === fileName
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {fileName}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Script</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer Block */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>server/{selectedPhpFile}</span>
              <span>{selectedPhpFile.endsWith('.php') ? 'PHP 8.4 Strict Mode' : 'MySQL 8.0 DDL'}</span>
            </div>

            <div className="p-4 max-h-[550px] overflow-y-auto">
              <pre className="text-xs font-mono text-slate-200 leading-relaxed">
                {PHP_CODE_TEMPLATES[selectedPhpFile]}
              </pre>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: System Architecture & ER Diagram */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          
          {/* Architecture Overview */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Full-Stack 3-Tier Web Architecture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                <div className="text-indigo-400 font-mono font-bold uppercase tracking-wider">
                  Tier 1: Client Browser (SPA)
                </div>
                <div className="text-white font-semibold text-sm">React 19 + HTML5 + CSS3</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Responsive single page application with component state, asynchronous Fetch API calls, accessible form validation, and real-time SVG QR code generation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                <div className="text-cyan-400 font-mono font-bold uppercase tracking-wider">
                  Tier 2: Middle-Tier API
                </div>
                <div className="text-white font-semibold text-sm">PHP 8.4 RESTful Services</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Stateless REST endpoints returning JSON payloads. PDO prepared statements with row-level seat locking (<code>FOR UPDATE</code>) to prevent race conditions during ticket booking.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                <div className="text-emerald-400 font-mono font-bold uppercase tracking-wider">
                  Tier 3: Relational Persistence
                </div>
                <div className="text-white font-semibold text-sm">MySQL / MariaDB (InnoDB)</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  3NF normalized database schema with foreign key constraints, composite index optimization on <code>event_date</code> and <code>booking_ref</code>, and ACID transactions.
                </p>
              </div>
            </div>
          </div>

          {/* Entity Relationship Diagram (ERD) Representation */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Entity Relationship (ER) Data Model</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400">3NF Normalized</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              
              {/* Table: users */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-3 py-2 bg-slate-900 font-bold text-slate-200 border-b border-slate-800">
                  TABLE: users
                </div>
                <div className="p-3 space-y-1 text-[11px] text-slate-400">
                  <div className="text-amber-400">🔑 id VARCHAR(36) [PK]</div>
                  <div>name VARCHAR(100)</div>
                  <div>email VARCHAR(120) [UNIQUE]</div>
                  <div>password_hash VARCHAR(255)</div>
                  <div>role ENUM('attendee','admin')</div>
                  <div>college VARCHAR(150)</div>
                  <div>created_at TIMESTAMP</div>
                </div>
              </div>

              {/* Table: events */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-3 py-2 bg-slate-900 font-bold text-slate-200 border-b border-slate-800">
                  TABLE: events
                </div>
                <div className="p-3 space-y-1 text-[11px] text-slate-400">
                  <div className="text-amber-400">🔑 id VARCHAR(50) [PK]</div>
                  <div>title VARCHAR(200)</div>
                  <div>category ENUM</div>
                  <div>event_date DATE</div>
                  <div>venue VARCHAR(150)</div>
                  <div>total_capacity INT</div>
                  <div>booked_count INT</div>
                  <div>base_price DECIMAL</div>
                </div>
              </div>

              {/* Table: ticket_tiers */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-3 py-2 bg-slate-900 font-bold text-slate-200 border-b border-slate-800">
                  TABLE: ticket_tiers
                </div>
                <div className="p-3 space-y-1 text-[11px] text-slate-400">
                  <div className="text-amber-400">🔑 id INT [PK]</div>
                  <div className="text-cyan-400">🔗 event_id [FK → events.id]</div>
                  <div>tier_type ENUM</div>
                  <div>price DECIMAL</div>
                  <div>total_seats INT</div>
                  <div>available_seats INT</div>
                </div>
              </div>

              {/* Table: bookings */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-3 py-2 bg-slate-900 font-bold text-slate-200 border-b border-slate-800">
                  TABLE: bookings
                </div>
                <div className="p-3 space-y-1 text-[11px] text-slate-400">
                  <div className="text-amber-400">🔑 id INT [PK]</div>
                  <div>booking_ref VARCHAR [UNIQUE]</div>
                  <div className="text-cyan-400">🔗 event_id [FK → events.id]</div>
                  <div className="text-cyan-400">🔗 user_id [FK → users.id]</div>
                  <div>tier ENUM</div>
                  <div>quantity INT</div>
                  <div>total_amount DECIMAL</div>
                  <div>qr_data TEXT</div>
                  <div>status ENUM</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
