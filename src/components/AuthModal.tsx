import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  X, 
  Lock, 
  User, 
  Mail, 
  Building, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  GraduationCap,
  Briefcase
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  onLogin: (user: UserProfile) => void;
  onRegister: (newUser: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  onLogin,
  onRegister,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState<string>('harish');
  const [loginPassword, setLoginPassword] = useState<string>('Harish@2006');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regCollege, setRegCollege] = useState<string>('Rajalakshmi Engineering College');
  const [regDepartment, setRegDepartment] = useState<string>('Information Technology');
  const [regRollNo, setRegRollNo] = useState<string>('2024-IT-');
  const [regError, setRegError] = useState<string | null>(null);

  // 1-Click Demo autofill handlers
  const handleQuickFill = (role: 'admin' | 'faculty' | 'student') => {
    if (role === 'admin') {
      setLoginIdentifier('admin');
      setLoginPassword('admin');
      setLoginError(null);
    } else if (role === 'faculty') {
      setLoginIdentifier('faculty');
      setLoginPassword('faculty123');
      setLoginError(null);
    } else {
      setLoginIdentifier('harish');
      setLoginPassword('Harish@2006');
      setLoginError(null);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = loginIdentifier.trim().toLowerCase();
    const cleanPw = loginPassword;

    // Search user by username, email, or name
    const foundUser = users.find(
      (u) =>
        (u.username.toLowerCase() === cleanId ||
          u.email.toLowerCase() === cleanId ||
          u.name.toLowerCase() === cleanId) &&
        u.password === cleanPw
    );

    if (foundUser) {
      onLogin(foundUser);
      onClose();
    } else {
      setLoginError('Invalid username or password. Please verify credentials or use a demo quick-fill button.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please complete all required registration fields.');
      return;
    }

    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanEmail = regEmail.trim().toLowerCase();

    // Check existing
    const existing = users.find(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      setRegError('A user with this username or email already exists. Please choose another or sign in.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: regPassword,
      role: regRole,
      college: regCollege.trim(),
      department: regDepartment.trim(),
      rollNo: regRole === 'student' ? regRollNo.trim() : undefined,
    };

    onRegister(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header with Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
              EventPulse Portal Access
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              {mode === 'login' ? 'Sign In to Your Account' : 'Create New User Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Sign In vs Create Account */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'login'
                ? 'border-indigo-500 text-white font-bold bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegError(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-indigo-500 text-white font-bold bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Create an Account (Sign Up)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          
          {mode === 'login' ? (
            <div className="space-y-4">
              
              {/* Quick Demo Autofill Buttons Bar */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Examiner Quick-Fill Credentials:</span>
                  <span className="text-indigo-400">1-Click</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    className="p-2 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/80 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Admin</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 mt-0.5 truncate">
                      admin / admin
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('faculty')}
                    className="p-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/80 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span>Faculty</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 mt-0.5 truncate">
                      faculty / faculty123
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('student')}
                    className="p-2 rounded-lg bg-indigo-950/40 hover:bg-indigo-950/70 border border-indigo-800/80 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      <span>Harish M</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 mt-0.5 truncate">
                      harish / Harish@2006
                    </div>
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Username / ID / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="admin, faculty, or harish"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate & Enter Portal</span>
                </button>
              </form>

              <div className="text-center pt-2 text-[11px] text-slate-400">
                New attendee or student?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Create an account
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-3">
              
              {regError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                
                {/* Role Selector */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('student')}
                      className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                        regRole === 'student'
                          ? 'border-indigo-500 bg-indigo-950/40 text-white font-bold ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      Student Attendee
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('faculty')}
                      className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                        regRole === 'faculty'
                          ? 'border-cyan-500 bg-cyan-950/40 text-white font-bold ring-1 ring-cyan-500'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      Faculty Coordinator
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Kavya S"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Choose Username
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. kavya"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="kavya@rajalakshmi.edu.in"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      required
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="Information Technology"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {regRole === 'student' ? (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Student Roll No
                      </label>
                      <input
                        type="text"
                        required
                        value={regRollNo}
                        onChange={(e) => setRegRollNo(e.target.value)}
                        placeholder="2024-IT-092"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        required
                        value={regCollege}
                        onChange={(e) => setRegCollege(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register & Auto Sign In</span>
                </button>

              </form>

              <div className="text-center pt-1 text-[11px] text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Sign in here
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
