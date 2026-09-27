import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import kasiFoodHero from '../assets/kasi-food-hero.jpg';
import TopSellers from '../components/TopSellers';
import VendorVacancies from '../components/VendorVacancies';
import ShareQR from '../components/ShareQR';
import { isLoggedIn } from '../lib/session';
import { api } from '../lib/api';

// Update these three with the real people who help vendors with poster design.
const POSTER_HELP_CONTACTS = [
  { name: 'Team member 1', whatsapp: '27000000001', email: 'design1@trustlink.africa' },
  { name: 'Team member 2', whatsapp: '27000000002', email: 'design2@trustlink.africa' },
  { name: 'Team member 3', whatsapp: '27000000003', email: 'design3@trustlink.africa' },
];

const stats = [
  { value: 'R900B+', label: 'annual value of South Africa\u2019s informal economy' },
  { value: '1.9M', label: 'active micro-businesses nationally' },
  { value: '80%', label: 'of informal businesses remain unregistered and unverifiable' },
  { value: '30%', label: 'of non-agricultural employment relies on this economy' },
];

const customerSteps = [
  { title: 'Search a vendor', body: 'Find a stall, spaza or service by name or area, even ones you only heard about by word of mouth.' },
  { title: 'Check their trust profile', body: 'See what\u2019s actually been verified: identity, location, availability and past customer feedback.' },
  { title: 'Buy with confidence', body: 'Visit or transact knowing who you\u2019re dealing with, before you spend a rand.' },
];

const vendorSteps = [
  { title: 'Create your profile', body: 'A once-off R50 registration fee lists your food business, products and location in minutes.' },
  { title: 'Get verified', body: 'Submit basic information so customers can see your business is real and active.' },
  { title: 'Build your reputation', body: 'Every genuine interaction adds to a trust history that follows your business, not just one post.' },
];

const features = [
  {
    title: 'Two-sided reputation',
    body: 'Both vendors and customers build a trustworthy record over time, not just a star rating.',
    color: '#3F6D4E',
    soft: '#DCE7DD',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Local-first trust',
    body: 'Built around how township and informal trade actually works, not formal e-commerce assumptions.',
    color: '#C98A2C',
    soft: '#F4E9D3',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: 'Verified and current',
    body: 'Stock, prices and location that update in real time, not a post from three months ago.',
    color: '#B8543A',
    soft: '#F3E2DA',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Community-driven',
    body: 'Referrals and verified interactions make the network more valuable as more real users join.',
    color: '#7A6A9C',
    soft: '#E7E1F0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="8" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 19c.7-2.8 2.6-4.3 4.5-4.3s3.8 1.5 4.5 4.3M11.5 19c.7-2.8 2.6-4.3 4.5-4.3s3.8 1.5 4.5 4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [audience, setAudience] = useState('customer');
  const steps = audience === 'customer' ? customerSteps : vendorSteps;
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState('checking');

  React.useEffect(() => {
    api.vendors()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('offline'));
  }, []);

  // "Find Kasi Food Near Me" only makes sense once you're signed in — nudge
  // signed-out visitors to sign in/sign up first, then straight to browsing.
  function handleFindFood() {
    navigate(isLoggedIn() ? '/dashboard' : '/signin?role=customer');
  }

  return (
    <div className="bg-[#F5EFE3] text-[#2B2118] font-['Inter',_system-ui,_sans-serif]">
      <header className="sticky top-0 z-40 bg-[#F5EFE3]/90 backdrop-blur border-b border-[#E4D9C3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#2B2118] text-[#F5EFE3] w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
              TL
            </div>
            <span className="font-['Fraunces',_Georgia,_serif] text-lg">TrustLink</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[#2B2118]/70">
            <a href="#home" className="hover:text-[#2B2118] transition">Home</a>
            <a href="#how-it-works" className="hover:text-[#2B2118] transition">How It Works</a>
            <a href="#top-sellers" className="hover:text-[#2B2118] transition">Top Sellers</a>
            <a href="#vacancies" className="hover:text-[#2B2118] transition">Vacancies</a>
            <a href="#features" className="hover:text-[#2B2118] transition">Why TrustLink</a>
            <a href="#contact" className="hover:text-[#2B2118] transition">Contact</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/signin?role=vendor" className="text-sm text-[#2B2118]/70 hover:text-[#2B2118] transition">I&apos;m a Vendor</Link>

            <Link to="/signin?role=customer" className="bg-[#C98A2C] hover:bg-[#B77A22] text-[#1A140D] text-sm font-semibold px-5 py-2.5 rounded-full transition">Find a Vendor</Link>
          </div>

          <button onClick={() => setNavOpen(!navOpen)} className="md:hidden text-[#2B2118]" aria-label="Toggle menu">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {navOpen && (
          <div className="md:hidden border-t border-[#E4D9C3] px-6 py-4 flex flex-col gap-3 text-sm">
            <a href="#home" onClick={() => setNavOpen(false)}>Home</a>
            <a href="#how-it-works" onClick={() => setNavOpen(false)}>How It Works</a>
            <a href="#top-sellers" onClick={() => setNavOpen(false)}>Top Sellers</a>
            <a href="#vacancies" onClick={() => setNavOpen(false)}>Vacancies</a>
            <a href="#features" onClick={() => setNavOpen(false)}>Why TrustLink</a>
            <a href="#contact" onClick={() => setNavOpen(false)}>Contact</a>
            <Link to="/signin?role=vendor" onClick={() => setNavOpen(false)}>I&apos;m a Vendor</Link>
          </div>
        )}
      </header>

      <section
        id="home"
        className="relative h-[85vh] min-h-[600px] overflow-hidden bg-[#2B2118] bg-cover bg-center"
        style={{ backgroundImage: `url(${kasiFoodHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A140D]/95 via-[#1A140D]/50 to-[#1A140D]/60" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#C98A2C] text-[#1A140D] w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px]">
              TL
            </div>
            <span className="text-white/70 text-xs tracking-wide">Brought to you by TrustLink</span>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/25 text-white text-xs px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FBF9F]" />
            Street Economy · Backing township food vendors
          </span>

          <h1 className="font-['Fraunces',_Georgia,_serif] text-[#C98A2C] text-4xl sm:text-5xl lg:text-6xl leading-[1.05] max-w-2xl">
            For the love of kasi food.
          </h1>
          <p className="mt-5 text-white/80 text-base sm:text-lg max-w-xl leading-relaxed">
            Find the braai stand, kota spot and vetkoek stall worth crossing the road for &mdash; verified, rated,
            and ready to take your order. TrustLink connects you to real street food vendors near you, and helps
            them turn every satisfied customer into a visible reputation.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={handleFindFood}
              className="bg-[#C98A2C] hover:bg-[#B77A22] text-[#1A140D] font-semibold text-sm px-6 py-3 rounded-full transition"
            >
              Find Kasi Food Near Me
            </button>
            <Link to="/signin?role=vendor" className="text-white text-sm border border-white/30 hover:border-white/60 px-6 py-3 rounded-full transition">
              I&apos;m a Vendor
            </Link>
          </div>
          <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-black/30 border border-white/20 px-3 py-1.5 text-xs text-white/80">
            <span className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-[#8FBF9F]' : apiStatus === 'offline' ? 'bg-[#B8543A]' : 'bg-[#C98A2C]'}`} />
            {apiStatus === 'connected' ? 'TrustLink API connected' : apiStatus === 'offline' ? 'TrustLink API offline' : 'Checking TrustLink API…'}
          </div>
        </div>
      </section>

      <section className="bg-[#2B2118] text-[#F5EFE3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-['Fraunces',_Georgia,_serif] text-3xl text-[#C98A2C]">{s.value}</p>
              <p className="text-xs sm:text-sm text-[#F5EFE3]/70 mt-1 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="top-sellers" className="bg-[#EFE7D4] border-y border-[#E4D9C3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-[#C98A2C] text-sm font-semibold mb-2 tracking-wide">This Month</p>
            <h2 className="font-['Fraunces',_Georgia,_serif] text-3xl sm:text-4xl leading-tight">
              Top Sellers of the Month
            </h2>
            <p className="mt-4 text-[#2B2118]/70">
              Ranked by verified orders and customer ratings &mdash; not paid placement.
            </p>
          </div>
          <TopSellers />
        </div>
      </section>

      <section id="vacancies" className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[#3F6D4E] text-sm font-semibold mb-2 tracking-wide">Kasi Jobs</p>
          <h2 className="font-['Fraunces',_Georgia,_serif] text-3xl sm:text-4xl leading-tight">
            Vendors are hiring
          </h2>
          <p className="mt-4 text-[#2B2118]/70">
            Verified vendors post openings directly &mdash; from braai assistants to delivery riders.
          </p>
        </div>
        <VendorVacancies />
      </section>

      <section className="bg-[#2B2118] text-[#F5EFE3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#C98A2C] text-sm font-semibold mb-2 tracking-wide">Built To Include Everyone</p>
            <h2 className="font-['Fraunces',_Georgia,_serif] text-3xl sm:text-4xl leading-tight">
              Kasi food, for every kind of customer
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-2xl mb-3">🎉</p>
              <h3 className="font-semibold mb-2">Free delivery, 50+</h3>
              <p className="text-[#F5EFE3]/70 leading-relaxed">Verified customers aged 50 and over never pay a delivery fee.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-2xl mb-3">🎓</p>
              <h3 className="font-semibold mb-2">Discounted for students &amp; pensioners</h3>
              <p className="text-[#F5EFE3]/70 leading-relaxed">A reduced delivery rate once a student or pensioner document is verified.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-2xl mb-3">🚶</p>
              <h3 className="font-semibold mb-2">Pickup is always free</h3>
              <p className="text-[#F5EFE3]/70 leading-relaxed">No one is required to pay a delivery fee &mdash; walk-in and collect any time.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-2xl mb-3">📱</p>
              <h3 className="font-semibold mb-2">No smartphone required to sell</h3>
              <p className="text-[#F5EFE3]/70 leading-relaxed">Vendors can onboard and manage their listing over WhatsApp.</p>
            </div>
          </div>
          <p className="text-center text-xs text-[#F5EFE3]/50 mt-10 max-w-2xl mx-auto">
            Age, student and pensioner status are confirmed through document verification before any discount is applied.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[#3F6D4E] text-sm font-semibold mb-2 tracking-wide">How It Works</p>
          <h2 className="font-['Fraunces',_Georgia,_serif] text-3xl sm:text-4xl leading-tight">
            One platform, two sides of the same trust problem
          </h2>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white border border-[#E4D9C3] rounded-full p-1">
            <button
              onClick={() => setAudience('customer')}
              className={`text-sm px-5 py-2 rounded-full transition ${
                audience === 'customer' ? 'bg-[#2B2118] text-[#F5EFE3]' : 'text-[#2B2118]/60'
              }`}
            >
              For Customers
            </button>
            <button
              onClick={() => setAudience('vendor')}
              className={`text-sm px-5 py-2 rounded-full transition ${
                audience === 'vendor' ? 'bg-[#2B2118] text-[#F5EFE3]' : 'text-[#2B2118]/60'
              }`}
            >
              For Vendors
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="bg-white border border-[#E4D9C3] rounded-2xl p-7">
              <span className="inline-flex w-8 h-8 rounded-full bg-[#F4E9D3] text-[#C98A2C] items-center justify-center text-sm font-bold mb-4">
                {i + 1}
              </span>
              <h3 className="font-['Fraunces',_Georgia,_serif] text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-[#2B2118]/70 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-[#EFE7D4] border-y border-[#E4D9C3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[#B8543A] text-sm font-semibold mb-2 tracking-wide">Why TrustLink</p>
            <h2 className="font-['Fraunces',_Georgia,_serif] text-3xl sm:text-4xl leading-tight">
              Not another marketplace. A trust layer for informal commerce.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-[#E4D9C3] rounded-2xl p-6">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: f.soft, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="font-['Fraunces',_Georgia,_serif] text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[#2B2118]/70 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="max-w-7xl mx-auto px-6 lg:px-10 py-20 text-center">
        <p className="text-[#3F6D4E] text-sm font-semibold mb-2 tracking-wide">Get Involved</p>
        <h2 className="font-['Fraunces',_Georgia,_serif] text-3xl sm:text-4xl leading-tight max-w-xl mx-auto">
          Whether you&apos;re buying or selling, trust shouldn&apos;t be a guess.
        </h2>
        <p className="mt-4 text-[#2B2118]/70 max-w-lg mx-auto">
          Live nationwide &mdash; all nine provinces, from the Western Cape to Limpopo. Reach out to join.
        </p>
        <a
          href="mailto:hello@trustlink.africa"
          className="inline-block mt-7 bg-[#C98A2C] hover:bg-[#B77A22] text-[#1A140D] font-semibold text-sm px-7 py-3.5 rounded-full transition"
        >
          hello@trustlink.africa
        </a>

        <div className="mt-14 text-left max-w-3xl mx-auto">
          <p className="text-center text-sm text-[#2B2118]/60 mb-6">
            Need a hand designing your stall poster or menu board? Message any of our team directly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {POSTER_HELP_CONTACTS.map((c) => (
              <div key={c.name} className="bg-white border border-[#E4D9C3] rounded-2xl p-5 text-center">
                <p className="font-semibold text-sm mb-3">{c.name}</p>
                <a
                  href={`https://wa.me/${c.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm font-semibold text-[#3F6D4E] mb-2"
                >
                  WhatsApp →
                </a>
                <a href={`mailto:${c.email}`} className="block text-xs text-[#2B2118]/60">
                  {c.email}
                </a>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex justify-center">
          <ShareQR />
        </div>
      </section>

      <footer className="bg-[#2B2118] text-[#F5EFE3]/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>TrustLink, {new Date().getFullYear()}</span>
          <span>For the love of kasi food &mdash; a local-first trust platform for street food vendors</span>
        </div>
      </footer>
    </div>
  );
}