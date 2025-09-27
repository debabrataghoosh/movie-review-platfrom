import React from 'react';
import { useAuth } from '../context/AuthContext';

const ageOptions = [
  { value: 'under-13', label: 'Under 13' },
  { value: '13-17', label: '13 - 17' },
  { value: '18-24', label: '18 - 24' },
  { value: '25-34', label: '25 - 34' },
  { value: '35-44', label: '35 - 44' },
  { value: '45-plus', label: '45+' },
];

const genreList = [
  'Action','Adventure','Animation','Comedy','Crime','Documentary','Drama','Family','Fantasy','History','Horror','Music','Mystery','Romance','Science Fiction','TV Movie','Thriller','War','Western'
];

const LoginModal = () => {
  const { loginOpen, closeLogin, signIn } = useAuth();

  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    age_category: '',
    genres: [],
  });
  const [otpRequested, setOtpRequested] = React.useState(false);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [devHint, setDevHint] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [usernameCheck, setUsernameCheck] = React.useState({ status: 'idle', message: '' });

  React.useEffect(() => {
    if (!loginOpen) {
      setStep(1);
      setForm({ name: '', email: '', phone: '', username: '', age_category: '', genres: [] });
      setOtpRequested(false);
      setOtpVerified(false);
      setOtpCode('');
      setDevHint('');
      setLoading(false);
    }
  }, [loginOpen]);

  if (!loginOpen) return null;

  const canContinueStep1 = !!form.name && (!!form.email || !!form.phone);
  const canContinueStep2 = !!form.username && !!form.age_category;
  const canVerify = otpRequested && !!otpCode;

  const requestOtp = async () => {
    if (!canContinueStep1) return;
    setLoading(true);
    try {
      const resp = await fetch('/api/auth-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email: form.email || undefined, phone: form.phone || undefined })
      });
      const j = await resp.json();
      if (!resp.ok) throw new Error(j?.error || 'OTP request failed');
      setOtpRequested(true);
      if (j.devCode) setDevHint(`Dev OTP: ${j.devCode}`);
      setStep(3);
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  const checkUsername = async () => {
    if (!form.username) return;
    setUsernameCheck({ status: 'checking', message: '' });
    try {
      const resp = await fetch(`/api/users?username=${encodeURIComponent(form.username)}`);
      const j = await resp.json();
      if (resp.ok && !j) {
        setUsernameCheck({ status: 'available', message: 'Username is available' });
      } else if (resp.ok && j) {
        setUsernameCheck({ status: 'taken', message: 'Username is already taken' });
      } else {
        setUsernameCheck({ status: 'error', message: 'Unable to check username' });
      }
    } catch (e) {
      setUsernameCheck({ status: 'error', message: 'Unable to check username' });
    }
  };

  const verifyOtp = async () => {
    if (!canVerify) return;
    setLoading(true);
    try {
      const resp = await fetch('/api/auth-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email: form.email || undefined, phone: form.phone || undefined, code: otpCode })
      });
      const j = await resp.json();
      if (!resp.ok || !j.ok) throw new Error(j?.error || 'OTP verification failed');
      setOtpVerified(true);
      setStep(4);
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      alert('Please verify OTP first');
      return;
    }
    const id = form.email || (form.phone ? `tel:${form.phone}` : form.username);
    const payload = { id, ...form };
    await signIn(form.name, form.email); // keep existing flow for compatibility
    try {
      await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch {}
    closeLogin();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeLogin} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-black/85 border border-white/10 ring-1 ring-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Sign in to CineRank</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm text-white/70 mb-1">Name</label>
                <input value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} type="text" className="w-full bg-white/5 rounded-md px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-red-500/50" placeholder="Your name" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Email</label>
                  <input value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))} type="email" className="w-full bg-white/5 rounded-md px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-red-500/50" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e)=>setForm(f=>({...f, phone:e.target.value}))} type="tel" className="w-full bg-white/5 rounded-md px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-red-500/50" placeholder="+91 98765 43210" />
                </div>
              </div>
              <p className="text-xs text-white/60">Provide email or phone (one is required).</p>
              <div className="flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={closeLogin} className="px-3 py-2 text-sm text-white/70 hover:text-white">Cancel</button>
                <button type="button" disabled={!canContinueStep1 || loading} onClick={()=>setStep(2)} className="px-4 py-2 rounded-md text-sm font-semibold bg-white/10 hover:bg-white/15 text-white disabled:opacity-50">Next</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm text-white/70 mb-1">Create a username</label>
                <div className="flex gap-2">
                  <input value={form.username} onChange={(e)=>{ setForm(f=>({...f, username:e.target.value.trim()})); setUsernameCheck({ status:'idle', message:''}); }} type="text" className="flex-1 bg-white/5 rounded-md px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-red-500/50" placeholder="cinefan123" />
                  <button type="button" onClick={checkUsername} className="px-3 py-2 rounded-md text-xs bg-white/10 hover:bg-white/15 text-white">Check</button>
                </div>
                {usernameCheck.status !== 'idle' && (
                  <p className={`mt-1 text-xs ${usernameCheck.status==='available' ? 'text-green-400' : usernameCheck.status==='taken' ? 'text-red-400' : 'text-white/60'}`}>{usernameCheck.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Age category</label>
                <select value={form.age_category} onChange={(e)=>setForm(f=>({...f, age_category:e.target.value}))} className="w-full bg-white/5 rounded-md px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-red-500/50">
                  <option value="">Select...</option>
                  {ageOptions.map(o=> (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Favorite genres</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto pr-1">
                  {genreList.map(g => (
                    <label key={g} className="inline-flex items-center gap-2 text-xs text-white/80">
                      <input type="checkbox" className="accent-red-500"
                        checked={form.genres.includes(g)}
                        onChange={(e)=>setForm(f=>{
                          const exists = f.genres.includes(g);
                          return { ...f, genres: exists ? f.genres.filter(x=>x!==g) : [...f.genres, g] };
                        })}
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={()=>setStep(1)} className="px-3 py-2 text-sm text-white/70 hover:text-white">Back</button>
                <button type="button" disabled={!canContinueStep2 || loading || usernameCheck.status==='taken'} onClick={requestOtp} className="px-4 py-2 rounded-md text-sm font-semibold bg-white/10 hover:bg-white/15 text-white disabled:opacity-50">Send OTP</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm text-white/70 mb-1">Enter OTP</label>
                <input value={otpCode} onChange={(e)=>setOtpCode(e.target.value)} inputMode="numeric" maxLength={6} className="w-full bg-white/5 rounded-md px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-red-500/50" placeholder="6-digit code" />
                {devHint && <p className="mt-2 text-xs text-white/50">{devHint}</p>}
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={()=>setStep(2)} className="px-3 py-2 text-sm text-white/70 hover:text-white">Back</button>
                <button type="button" disabled={!canVerify || loading} onClick={verifyOtp} className="px-4 py-2 rounded-md text-sm font-semibold bg-white/10 hover:bg-white/15 text-white disabled:opacity-50">Verify</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="p-3 rounded-lg bg-green-900/30 text-green-300 text-sm">OTP verified. Complete sign-in to save your profile.</div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={closeLogin} className="px-3 py-2 text-sm text-white/70 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-500 text-white">Sign In</button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
