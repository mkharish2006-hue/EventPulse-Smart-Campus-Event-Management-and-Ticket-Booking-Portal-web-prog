import React, { useState } from 'react';
import { VIVA_QUESTIONS } from '../data/initialData';
import { VivaQuestion } from '../types';
import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  GraduationCap, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';

export const VivaStudyCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'report'>('flashcards');
  
  // Flashcards state
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});

  // Quiz mode state
  const [quizQuestions] = useState<Array<{
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>>([
    {
      id: 1,
      question: 'Which method in PHP PDO effectively neutralizes SQL Injection vulnerabilities?',
      options: [
        'Using addslashes() on $_POST variables',
        'Prepared Statements with bound parameters (PDO::prepare and execute)',
        'md5() hashing of all SQL query strings',
        'Writing raw SQL strings inside double quotes'
      ],
      correctIndex: 1,
      explanation: 'Prepared statements separate the query template from input data literals, compiling the SQL grammar before parameter injection.'
    },
    {
      id: 2,
      question: 'In React, what is the primary benefit of the reconciliation diffing algorithm?',
      options: [
        'It converts JSX into vanilla CSS stylesheets',
        'It identifies the minimal batch of changes needed in the real DOM',
        'It stores database records directly in browser cookies',
        'It executes synchronous PHP functions inside web workers'
      ],
      correctIndex: 1,
      explanation: 'Reconciliation compares the new Virtual DOM tree with the previous one and only mutates the minimal required nodes in the real browser DOM.'
    },
    {
      id: 3,
      question: 'Which HTTP status code should a RESTful PHP endpoint return upon successfully creating a new booking?',
      options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
      correctIndex: 1,
      explanation: 'HTTP 201 Created is the standard REST status code when a POST request successfully creates a new resource.'
    },
    {
      id: 4,
      question: 'Why is CSS Grid better suited than Flexbox for an auditorium seat layout matrix?',
      options: [
        'Grid is one-dimensional while Flexbox handles 3D graphics',
        'Grid controls two dimensions (rows AND columns) simultaneously',
        'Flexbox cannot support click event handlers',
        'Grid does not require modern browser rendering'
      ],
      correctIndex: 1,
      explanation: 'CSS Grid provides full 2D control over both rows and columns simultaneously, making seat matrices and coordinate cards effortless.'
    },
    {
      id: 5,
      question: 'In event ticketing, what MySQL locking clause prevents double-booking race conditions during high demand?',
      options: ['LOCK IN SHARE MODE', 'SELECT ... FOR UPDATE inside a transaction', 'DROP TABLE bookings', 'AUTO_INCREMENT'],
      correctIndex: 1,
      explanation: 'SELECT ... FOR UPDATE locks the specific event row during a transaction until the commit completes, ensuring atomic seat decrements.'
    }
  ]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Academic Report Copy state
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const toggleReveal = (id: number) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredQuestions = VIVA_QUESTIONS.filter((q) => {
    if (selectedTopic === 'All') return true;
    return q.topic === selectedTopic;
  });

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateQuizScore = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const academicReportMarkdown = `# ACADEMIC PROJECT REPORT
## COURSE: IT3511 - WEB PROGRAMMING LABORATORY
### RAJALAKSHMI ENGINEERING COLLEGE, CHENNAI
**Department of Information Technology**

---

### PROJECT TITLE:
**EventPulse - Smart Campus Event Management & Digital Ticket Booking Portal**

**STUDENT PARTICULARS:**
- **Candidate Name**: Harish M
- **Register / Roll No**: 2024-IT-048
- **Degree & Branch**: B.Tech - Information Technology (Batch: 2024–2028)
- **Course Title**: Web Programming Laboratory (IT3511)
- **Faculty Guide**: Department of Information Technology, REC

---

### 1. ABSTRACT
Campus fests, hackathons, and technical symposiums require a robust, reliable web ticketing platform capable of handling high-volume seat reservations while providing role-based controls for attendees and coordinators. EventPulse is developed as a full-stack web application employing HTML5, CSS3, JavaScript (ES6+), React.js, PHP 8.4, and MySQL. The system provides an interactive multi-tier ticket booking workflow, algorithmic SVG QR pass generation, atomic seat reservation transactions using PDO with row locking, and an administrative check-in verification scanner.

### 2. SYSTEM ARCHITECTURE & TECH STACK
- **Frontend Layer**: Semantic HTML5, Tailwind CSS 4, React 19 Single Page Application, Lucide Icons.
- **Middle-Tier REST API**: PHP 8.4 RESTful controllers (PDO connection wrapper, JSON serialization, CORS headers, session auth).
- **Database Layer**: MySQL 8.0 InnoDB engine with 3NF normalized schema (users, events, ticket_tiers, bookings) and foreign key integrity.

### 3. CORE MODULES & FEATURES
1. **Attendee Registration & Discovery**: Searchable event catalog with category filtering and schedule breakdown.
2. **Interactive Ticketing Engine**: Multi-tier pricing (VIP, Standard, Student), student promo code validator (REC2024), and real-time total calculation.
3. **Digital Pass & QR Code Generator**: Generates scannable SVG digital passes with unique booking hashes and printable layout.
4. **Administrative Console**: KPI metrics tracking registrations, revenue in INR, capacity fill rates, and live gate check-in scanner.
5. **Security Implementations**: PDO prepared statements preventing SQL injection, htmlspecialchars preventing XSS, and database transactions preventing race-condition overbooking.

### 4. SAMPLE SQL SCHEMA
\`\`\`sql
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_ref VARCHAR(30) NOT NULL UNIQUE,
    event_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    tier ENUM('Student', 'Standard', 'VIP') NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    total_amount DECIMAL(8, 2) NOT NULL,
    qr_data TEXT NOT NULL,
    status ENUM('Confirmed', 'Checked-In', 'Cancelled') DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
\`\`\`

---
*Verified and submitted for Web Programming Lab Evaluation.*`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(academicReportMarkdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-emerald-400 font-mono flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Evaluation Suite · Rajalakshmi Engineering College (IT)</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Viva Voce & Project Documentation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Student: <strong className="text-slate-200">Harish M (2024-IT)</strong> · Review-ready documentation & exam flashcards.
          </p>
        </div>

        {/* View Switcher Tabs (Segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'flashcards'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Viva Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Viva Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Project Report</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Viva Voce Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          
          {/* Topic filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-mono mr-1">Filter by Topic:</span>
            {['All', 'HTML5', 'CSS3', 'JavaScript', 'React.js', 'PHP & MySQL'].map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedTopic === topic
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Flashcards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestions.map((q) => {
              const isRevealed = revealedIds[q.id];
              return (
                <div
                  key={q.id}
                  className="flex flex-col justify-between p-5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-750 transition-all space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-semibold">{q.topic}</span>
                      <span className="text-slate-500">Q#{q.id}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-white mt-2 leading-snug">
                      {q.question}
                    </h4>

                    {/* Key Concepts Unboxed Chips */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                      {q.keyConcepts.map((concept, idx) => (
                        <span key={idx} className="text-indigo-300">
                          #{concept}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Revealed Answer Box */}
                  <div>
                    {isRevealed ? (
                      <div className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                        <strong className="text-emerald-400 block mb-1">Model Examiner Answer:</strong>
                        {q.answer}
                      </div>
                    ) : null}

                    <button
                      onClick={() => toggleReveal(q.id)}
                      className="mt-3 w-full py-1.5 text-xs font-semibold rounded-lg border border-slate-750 bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors cursor-pointer text-center"
                    >
                      {isRevealed ? 'Hide Answer' : 'Reveal Model Answer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Tab 2: Interactive Viva Quiz */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Web Programming Viva Exam Simulator</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                5 targeted multiple choice questions testing HTML5, CSS3, React reconciliation, PHP PDO, and MySQL concurrency.
              </p>
            </div>

            {quizSubmitted && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Your Score</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">
                    {calculateQuizScore()} / {quizQuestions.length}
                  </div>
                </div>
                <button
                  onClick={resetQuiz}
                  className="px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-750 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>
            )}
          </div>

          {/* Quiz Questions List */}
          <div className="space-y-4">
            {quizQuestions.map((q, qIndex) => {
              const selectedOpt = selectedAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>QUESTION {qIndex + 1} OF {quizQuestions.length}</span>
                    {quizSubmitted && (
                      <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {isCorrect ? '✓ Correct (+1)' : '✗ Incorrect (0)'}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-white leading-snug">
                    {q.question}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2 mt-2">
                    {q.options.map((option, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;
                      let optionStyle = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700';

                      if (quizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          optionStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500';
                        } else if (isOptionSelected) {
                          optionStyle = 'border-rose-500 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`w-full p-3 rounded-lg border text-left flex items-start gap-3 transition-colors cursor-pointer ${optionStyle}`}
                        >
                          <span className="font-mono font-bold text-slate-400 shrink-0">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="flex-1">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submit */}
                  {quizSubmitted && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                      <strong className="text-slate-200">Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-md shadow-emerald-600/30"
              >
                Submit Viva Quiz & Review
              </button>
            </div>
          )}

        </div>
      )}

      {/* Tab 3: Formal Academic Project Report */}
      {activeTab === 'report' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900">
            <div>
              <h3 className="text-sm font-bold text-white">Full Academic Project Report (Markdown & Printable)</h3>
              <p className="text-xs text-slate-400">Complete record sheet for laboratory submission and external review</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-750 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Record</span>
              </button>
            </div>
          </div>

          {/* Formatted Project Document Preview */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950 text-slate-300 space-y-6 text-xs leading-relaxed font-sans shadow-inner max-h-[600px] overflow-y-auto">
            
            <div className="text-center pb-6 border-b border-slate-800 space-y-1">
              <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
                RAJALAKSHMI ENGINEERING COLLEGE (AUTONOMOUS)
              </div>
              <div className="text-sm font-semibold text-slate-200">DEPARTMENT OF INFORMATION TECHNOLOGY</div>
              <div className="text-xs text-slate-400">IT3511 - WEB PROGRAMMING LABORATORY RECORD</div>
              <h2 className="text-xl font-bold text-white mt-3">
                EventPulse: Smart Campus Event Management & Digital Ticketing Portal
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Submitted By:</span>
                <span className="font-bold text-white text-sm">Harish M</span>
                <span className="text-slate-400 block text-[11px]">Roll No: 2024-IT-048</span>
              </div>
              <div>
                <span className="text-slate-400 block">Course & Department:</span>
                <span className="font-bold text-white text-sm">B.Tech Information Technology</span>
                <span className="text-slate-400 block text-[11px]">Academic Year: 2024–2028</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-300">
                1. System Overview & Problem Statement
              </h3>
              <p>
                Collegiate events require synchronized participant registrations with strict capacity constraints, verifiable pass generation, and quick venue gate check-in. Existing legacy portals suffer from race-condition overbooking during high-traffic hackathon registrations and lack responsive mobile ticket presentation. EventPulse bridges this gap with an asynchronous React single page frontend communicating with a hardened PHP 8.4 REST API backed by an InnoDB MySQL relational database.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-300">
                2. Technologies Employed
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>HTML5</strong>: Semantic document structures (header, nav, main, article, dialog) and accessible ARIA attributes.</li>
                <li><strong>CSS3</strong>: Tailwind CSS utility framework, CSS Grid seat allocation matrix, Flexbox toolbars, and responsive viewport breakpoints.</li>
                <li><strong>JavaScript (ES6+)</strong>: Promises, async/await Fetch API requests, QR code algorithmic generation, array transformations.</li>
                <li><strong>React.js</strong>: Component architecture, useState, useMemo, custom hooks, and role-based view routing.</li>
                <li><strong>PHP 8.4</strong>: RESTful middle-tier, PDO prepared statements, transaction rollback on failure, JSON serialization, and password_verify auth.</li>
                <li><strong>MySQL</strong>: 3NF normalized tables (users, events, ticket_tiers, bookings) with foreign keys and compound indexing.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-300">
                3. Security & Transaction Integrity
              </h3>
              <p>
                To prevent race conditions when multiple students reserve the last available seat, the PHP booking endpoint initiates a database transaction with a row lock:
              </p>
              <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
SELECT total_capacity, booked_count FROM events WHERE id = :id FOR UPDATE;
              </pre>
              <p>
                Untrusted inputs are handled exclusively via parameter binding in PDO to eradicate SQL injection attacks.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center text-slate-500 font-mono text-[11px]">
              End of Laboratory Record Documentation · Rajalakshmi Engineering College
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
