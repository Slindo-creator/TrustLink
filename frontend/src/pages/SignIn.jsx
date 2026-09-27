import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { setSession } from '../lib/session';
import { useSpeech } from '../lib/useSpeech';
import kasiFoodHero from '../assets/kasi-food-hero.jpg';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
];

function ListenButton({ id, text, speak, speakingId }) {
  const active = speakingId === id;
  return (
    <button
      type="button"
      onClick={() => speak(id, text)}
      aria-label={active ? 'Stop reading aloud' : 'Read this aloud'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition shrink-0 ${
        active ? 'bg-[#3F6D4E] border-[#3F6D4E] text-white' : 'bg-white border-[#E4D9C3] text-[#2B2118]/60 hover:border-[#2B2118]/40'
      }`}
    >
      {active ? '⏸' : '🔊'}
    </button>
  );
}

function ChoiceTile({ emoji, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl border-2 border-[#E4D9C3] bg-white hover:border-[#C98A2C]/60 hover:-translate-y-0.5 transition p-5 flex items-center gap-4 min-h-[76px]"
    >
      <span className="text-4xl leading-none" aria-hidden="true">{emoji}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-xs text-[#2B2118]/60 mt-0.5">{subtitle}</span>
      </span>
    </button>
  );
}

function ProgressDots({ step, total }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`h-1.5 rounded-full ${i < step ? 'bg-[#C98A2C] w-6' : 'bg-[#E4D9C3] w-3'}`} />
      ))}
    </div>
  );
}

export default function SignIn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const roleParam = params.get('role') === 'vendor' ? 'vendor' : 'customer';

  const [role, setRole] = useState(roleParam);
  const [isNewUser, setIsNewUser] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [generalArea, setGeneralArea] = useState('');
  const [province, setProvince] = useState(PROVINCES[2]);
  const [coords, setCoords] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bigText, setBigText] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { speak, speakingId } = useSpeech();
  const step = isNewUser === null ? 1 : 2;

  function useMyLocation() {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function resetChoice(nextRole) {
    setRole(nextRole);
    setIsNewUser(null);
    setError('');
  }

  async function submitAuth(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const data = isNewUser
        ? await api.signup({
            role: role.toUpperCase(),
            name: name.trim(),
            email: email.trim(),
            password,
            phone: phone.trim() || null,
            ...(role === 'vendor' ? { businessName: businessName.trim() } : {}),
          })
        : await api.login({ email: email.trim(), password });

      setSession({
        token: data.token,
        refreshToken: data.refreshToken,
        userId: data.userId,
        role: data.role,
        name: data.name,
      });

      if (role === 'vendor' && isNewUser) {
        if (generalArea.trim() || coords) {
          try {
            await api.updateVendor({
              businessName: businessName.trim(),
              description: '',
              generalArea: generalArea.trim()
                ? `${generalArea.trim()}, ${province}`
                : province,
              preciseLatitude: coords?.lat ?? null,
              preciseLongitude: coords?.lng ?? null,
              locationVisible: Boolean(coords),
            });
          } catch (profileError) {
            console.warn('Vendor profile update failed after signup:', profileError);
          }
        }
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'We could not complete that request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`min-h-screen relative text-[#2B2118] font-['Inter',_system-ui,_sans-serif] flex flex-col ${bigText ? 'text-lg' : 'text-base'}`}>
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${kasiFoodHero})` }} aria-hidden="true" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#1A140D]/85 via-[#1A140D]/70 to-[#F5EFE3]" aria-hidden="true" />

      <header className="relative z-10 px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-white text-[#2B2118] w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">TL</div>
          <span className="font-['Fraunces',_Georgia,_serif] text-lg text-white">TrustLink</span>
        </Link>
        <button
          type="button"
          onClick={() => setBigText((v) => !v)}
          className="text-xs font-semibold bg-white/15 text-white border border-white/30 rounded-full px-3 py-1.5 min-h-[36px]"
        >
          {bigText ? ' Normal text' : ' Bigger text'}
        </button>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md bg-white border border-[#E4D9C3] rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between mb-6">
            <ProgressDots step={step} total={2} />
            <ListenButton
              id="intro"
              speak={speak}
              speakingId={speakingId}
              text={role === 'vendor'
                ? 'Welcome vendor. Sign in or create your TrustLink food business profile.'
                : 'Welcome. Sign in or create your TrustLink customer profile.'}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#F4E9D3] rounded-2xl p-1.5 mb-6">
            <button className={`text-sm px-3 py-3 rounded-xl font-semibold ${role === 'customer' ? 'bg-[#2B2118] text-[#F5EFE3]' : 'text-[#2B2118]/60'}`} onClick={() => resetChoice('customer')}>
              Find food
            </button>
            <button className={`text-sm px-3 py-3 rounded-xl font-semibold ${role === 'vendor' ? 'bg-[#2B2118] text-[#F5EFE3]' : 'text-[#2B2118]/60'}`} onClick={() => resetChoice('vendor')}>
             I sell food
            </button>
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-[#B8543A]/30 bg-[#F3E2DA] text-[#7A2F20] px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {isNewUser === null && (
            <div className="space-y-3">
              <p className="text-sm text-[#2B2118]/70 mb-1">Do you already have a TrustLink profile?</p>
              <ChoiceTile  title="Yes, sign me in" subtitle="Use your email and password" onClick={() => setIsNewUser(false)} />
              <ChoiceTile  title="No, I'm new here" subtitle="Create your account in under a minute" onClick={() => setIsNewUser(true)} />
            </div>
          )}

          {isNewUser !== null && (
            <form className="space-y-4" onSubmit={submitAuth}>
              <button type="button" onClick={() => { setIsNewUser(null); setError(''); }} className="text-xs text-[#2B2118]/50 hover:text-[#2B2118]">
                ← Back
              </button>

              {isNewUser && role === 'vendor' && (
                <div className="bg-[#F4E9D3] border border-[#E4D9C3] rounded-2xl p-4 text-sm">
                  <p className="font-bold">Create your food business profile</p>
                  <p className="text-[#2B2118]/70 mt-1">Your account is created by the TrustLink API, then your business profile is saved to the vendor profile.</p>
                </div>
              )}

              {isNewUser && (
                <label className="block text-sm">
                  <span className="text-[#2B2118]/70">Full name</span>
                  <input required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border-2 border-[#E4D9C3] rounded-xl px-4 py-3 min-h-[48px]" />
                </label>
              )}

              {isNewUser && role === 'vendor' && (
                <>
                  <label className="block text-sm">
                    <span className="text-[#2B2118]/70">Business name</span>
                    <input required maxLength={150} value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1 w-full border-2 border-[#E4D9C3] rounded-xl px-4 py-3 min-h-[48px]" placeholder="e.g. Mama Thandi's Kota Corner" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-[#2B2118]/70">Area / township</span>
                    <input value={generalArea} onChange={(e) => setGeneralArea(e.target.value)} className="mt-1 w-full border-2 border-[#E4D9C3] rounded-xl px-4 py-3 min-h-[48px]" placeholder="e.g. Orlando West" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-[#2B2118]/70">Province</span>
                    <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1 w-full border-2 border-[#E4D9C3] rounded-xl px-4 py-3 min-h-[48px] bg-white">
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </label>
                  <button type="button" onClick={useMyLocation} className="text-xs font-semibold text-[#3F6D4E] min-h-[36px]">
                    {coords ? '✓ Pinned your exact location' : 'Add my exact location (optional)'}
                  </button>
                </>
              )}

              <label className="block text-sm">
                <span className="text-[#2B2118]/70">Email address</span>
                <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border-2 border-[#E4D9C3] rounded-xl px-4 py-3 min-h-[48px]" />
              </label>

              {isNewUser && (
                <label className="block text-sm">
                  <span className="text-[#2B2118]/70">Phone (optional)</span>
                  <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full border-2 border-[#E4D9C3] rounded-xl px-4 py-3 min-h-[48px]" />
                </label>
              )}

              <label className="block text-sm">
                <span className="text-[#2B2118]/70">Password</span>
                <input required minLength={8} maxLength={72} type="password" autoComplete={isNewUser ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border-2 border-[#E4D9C3] rounded-xl px-4 py-3 min-h-[48px]" />
              </label>

              <button disabled={busy} type="submit" className="w-full bg-[#C98A2C] hover:bg-[#B77A22] disabled:opacity-60 text-[#1A140D] font-bold text-sm py-3.5 rounded-full min-h-[48px]">
                {busy ? 'Connecting…' : isNewUser ? (role === 'vendor' ? ' Register my food business' : ' Create account & find food') : 'Continue →'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
