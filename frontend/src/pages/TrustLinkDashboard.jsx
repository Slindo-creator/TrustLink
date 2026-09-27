import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { clearSession, getSession, isLoggedIn, updateSession } from '../lib/session';

const sectorMeta = {
  'Braai & Shisanyama': { color: '#B8543A', soft: '#F3E2DA', emoji: '' },
  'Kota & Fast Food': { color: '#C98A2C', soft: '#F4E9D3', emoji: '' },
  'Bakery & Snacks': { color: '#3F6D4E', soft: '#DCE7DD', emoji: '' },
};
const fallbackMeta = { color: '#7A6A9C', soft: '#E7E1F0', emoji: '' };

function VendorCard({ vendor, onOpen, onAudio, audioPlaying }) {
  const meta = sectorMeta[vendor.category] || fallbackMeta;
  return (
    <article className="bg-white border border-[#E4D9C3] rounded-2xl overflow-hidden">
      <div className="h-24 flex items-end p-4" style={{ background: `linear-gradient(135deg, ${meta.soft}, ${meta.color}33)` }}>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90" style={{ color: meta.color }}>
          {meta.emoji} {vendor.category || 'Food vendor'}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-['Fraunces',_Georgia,_serif] text-lg leading-snug">{vendor.businessName}</h3>
        <p className="text-sm text-[#2B2118]/60 mt-1">{vendor.generalArea || 'Area not listed'}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-[#E4D9C3]">
          <div>
            <span className="font-bold" style={{ color: meta.color }}>{Number(vendor.trustScore || 0).toFixed(1)}</span>
            <span className="text-sm text-[#2B2118]/40 ml-1">trust score</span>
          </div>
          <span className="text-sm text-[#2B2118]/60">{vendor.reviewCount} reviews</span>
        </div>
        <p className="text-xs text-[#2B2118]/50 mt-3">
          {vendor.verificationStatus} · {vendor.active ? 'Active' : 'Inactive'}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onAudio(vendor)}
            className="flex-1 text-sm font-semibold py-3 rounded-full text-white min-h-[44px]"
            style={{ backgroundColor: meta.color }}
          >
            🔊 {audioPlaying ? 'Stop audio' : 'Hear summary'}
          </button>
          <button onClick={() => onOpen(vendor)} className="flex-1 text-sm font-semibold py-3 rounded-full border border-[#2B2118]/20 min-h-[44px]">
            View profile
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductManager({ products, onCreate, onUpdate, onDelete }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', available: true });
  const [editingId, setEditingId] = useState(null);

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price === '' ? null : Number(form.price),
      available: Boolean(form.available),
    };
    if (editingId) onUpdate(editingId, payload);
    else onCreate(payload);
    setForm({ name: '', description: '', price: '', available: true });
    setEditingId(null);
  }

  function edit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price ?? '',
      available: product.available,
    });
  }

  return (
    <div className="bg-white border border-[#E4D9C3] rounded-2xl p-6">
      <h3 className="font-['Fraunces',_Georgia,_serif] text-2xl mb-5">Manage your products</h3>
      <form onSubmit={submit} className="grid gap-3 mb-7">
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="border border-[#E4D9C3] rounded-xl px-4 py-3" />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="border border-[#E4D9C3] rounded-xl px-4 py-3" />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (R)" className="border border-[#E4D9C3] rounded-xl px-4 py-3" />
          <label className="flex items-center gap-2 border border-[#E4D9C3] rounded-xl px-4 py-3 text-sm">
            <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
            Available
          </label>
        </div>
        <button className="bg-[#C98A2C] text-[#1A140D] font-semibold rounded-full py-3">
          {editingId ? 'Save product' : 'Add product'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', description: '', price: '', available: true }); }} className="text-sm text-[#2B2118]/60">
            Cancel edit
          </button>
        )}
      </form>

      <div className="space-y-3">
        {products.length === 0 && <p className="text-sm text-[#2B2118]/50">No products yet. Add your first menu item above.</p>}
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between gap-4 border-t border-[#E4D9C3] pt-3">
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-xs text-[#2B2118]/60">{product.description}</p>
              <p className="text-sm mt-1">R{product.price ?? '—'} · {product.available ? 'Available' : 'Unavailable'}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => edit(product)} className="text-xs font-semibold px-3 py-2 rounded-full border border-[#E4D9C3]">Edit</button>
              <button onClick={() => onDelete(product.id)} className="text-xs font-semibold px-3 py-2 rounded-full border border-[#B8543A]/30 text-[#B8543A]">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrustLinkDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const isVendor = session?.role === 'VENDOR';

  const [vendors, setVendors] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [ownVendor, setOwnVendor] = useState(null);
  const [ownProducts, setOwnProducts] = useState([]);
  const [profileForm, setProfileForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [bigText, setBigText] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('online');
  const [exploredIds, setExploredIds] = useState(new Set());
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/signin?role=customer', { replace: true });
      return;
    }
    loadVendors('');
    if (isVendor) loadOwnVendor();
  }, [isVendor, navigate]);

  async function loadVendors(search) {
    setLoading(true);
    setError('');
    try {
      let data;
      if (search?.trim()) {
        const term = search.trim();
        const [byName, byArea] = await Promise.all([
          api.vendors({ name: term }),
          api.vendors({ area: term }),
        ]);
        const merged = [...(byName || []), ...(byArea || [])];
        data = Array.from(new Map(merged.map((vendor) => [vendor.id, vendor])).values());
      } else {
        data = await api.vendors();
      }
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadOwnVendor() {
    try {
      const profile = await api.ownVendor();
      setOwnVendor(profile);
      setProfileForm({
        businessName: profile.businessName || '',
        description: profile.description || '',
        generalArea: profile.generalArea || '',
        preciseLatitude: profile.preciseLatitude ?? null,
        preciseLongitude: profile.preciseLongitude ?? null,
        locationVisible: Boolean(profile.preciseLatitude != null && profile.preciseLongitude != null),
      });
      const data = await api.products(profile.id);
      setOwnProducts(data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function openVendor(vendor) {
    setSelectedVendor(vendor);
    setExploredIds((prev) => new Set(prev).add(vendor.id));
    try {
      const [profile, productData, reviewData] = await Promise.all([
        api.vendor(vendor.id),
        api.products(vendor.id),
        api.reviews(vendor.id),
      ]);
      setSelectedVendor(profile);
      setProducts(productData || []);
      setReviews(reviewData || []);
    } catch (err) {
      setError(err.message);
    }
  }

  function speakVendor(vendor) {
    const text = `${vendor.businessName}, located in ${vendor.generalArea || 'an area not listed'}. Trust score ${Number(vendor.trustScore || 0).toFixed(1)}. ${vendor.reviewCount} customer reviews. Verification status ${vendor.verificationStatus}.`;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (isAudioPlaying) {
      setIsAudioPlaying(false);
      return;
    }
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-ZA';
    utterance.onend = () => setIsAudioPlaying(false);
    utterance.onerror = () => setIsAudioPlaying(false);
    setIsAudioPlaying(true);
    window.speechSynthesis.speak(utterance);
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!selectedVendor) return;
    try {
      const created = await api.createReview(selectedVendor.id, {
        rating: Number(review.rating),
        comment: review.comment.trim(),
      });
      setReviews((prev) => [created, ...prev]);
      setReview({ rating: 5, comment: '' });
      const refreshed = await api.vendor(selectedVendor.id);
      setSelectedVendor(refreshed);
      setVendors((prev) => prev.map((v) => v.id === refreshed.id ? refreshed : v));
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const updated = await api.updateVendor(profileForm);
      setOwnVendor(updated);
      setProfileForm({
        businessName: updated.businessName || '',
        description: updated.description || '',
        generalArea: updated.generalArea || '',
        preciseLatitude: updated.preciseLatitude ?? null,
        preciseLongitude: updated.preciseLongitude ?? null,
        locationVisible: Boolean(updated.preciseLatitude != null && updated.preciseLongitude != null),
      });
      updateSession({ name: updated.businessName });
    } catch (err) {
      setError(err.message);
    }
  }

  async function createProduct(data) {
    try {
      const product = await api.createProduct(data);
      setOwnProducts((prev) => [...prev, product]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateProduct(id, data) {
    try {
      const product = await api.updateProduct(id, data);
      setOwnProducts((prev) => prev.map((p) => p.id === id ? product : p));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteProduct(id) {
    try {
      await api.deleteProduct(id);
      setOwnProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    const refreshToken = localStorage.getItem('trustlink_refresh_token');
    try {
      if (refreshToken) await api.logout(refreshToken);
    } catch {
      // Local logout still happens if the server session is already gone.
    }
    clearSession();
    navigate('/');
  }

  return (
    <div className={`min-h-screen bg-[#F5EFE3] text-[#2B2118] font-['Inter',_system-ui,_sans-serif] ${bigText ? 'text-lg' : ''}`}>
      <header className="sticky top-0 z-30 bg-[#2B2118] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 min-h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#F5EFE3] text-[#2B2118] w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm">TL</div>
            <div>
              <p className="font-['Fraunces',_Georgia,_serif] text-lg leading-none">TrustLink</p>
              <p className="text-[10px] text-white/70 mt-0.5">Live API dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-white/70">{session?.name}</span>
            <button onClick={() => setBigText((v) => !v)} className="text-xs font-semibold bg-white/10 border border-white/30 rounded-full px-3 py-2">
              {bigText ? 'Normal text' : 'Bigger text'}
            </button>
            <button onClick={logout} className="text-xs font-semibold bg-[#C98A2C] text-[#1A140D] rounded-full px-4 py-2">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 space-y-10">
        {error && (
          <div className="rounded-xl border border-[#B8543A]/30 bg-[#F3E2DA] text-[#7A2F20] px-4 py-3 text-sm flex justify-between gap-4">
            <span>{error}</span>
            <button onClick={() => setError('')} aria-label="Dismiss">×</button>
          </div>
        )}

        <section className="bg-[#2B2118] text-[#F5EFE3] rounded-3xl p-8 md:p-12">
          <p className="text-[#C98A2C] text-sm font-semibold mb-2">Verified informal ledger</p>
          <h1 className="font-['Fraunces',_Georgia,_serif] text-4xl md:text-5xl max-w-3xl">Trust that lives in the real vendor profile.</h1>
          <p className="mt-4 text-white/75 max-w-2xl">This screen now reads vendor data, products and reviews directly from the TrustLink Spring API.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') loadVendors(query); }}
              placeholder="Search vendor name or area"
              className="flex-1 bg-white text-[#2B2118] rounded-full px-5 py-3 min-h-[48px]"
            />
            <button onClick={() => loadVendors(query)} className="bg-[#C98A2C] text-[#1A140D] font-semibold rounded-full px-6 py-3 min-h-[48px]">
              Search
            </button>
            <button onClick={() => loadVendors('')} className="border border-white/30 rounded-full px-5 py-3 min-h-[48px]">
              All vendors
            </button>
          </div>
        </section>

        {isVendor && ownVendor && profileForm && (
          <section className="grid lg:grid-cols-2 gap-6">
            <form onSubmit={saveProfile} className="bg-white border border-[#E4D9C3] rounded-2xl p-6">
              <h2 className="font-['Fraunces',_Georgia,_serif] text-2xl mb-5">Your vendor profile</h2>
              <div className="space-y-3">
                <input required value={profileForm.businessName} onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })} className="w-full border border-[#E4D9C3] rounded-xl px-4 py-3" placeholder="Business name" />
                <textarea value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} className="w-full border border-[#E4D9C3] rounded-xl px-4 py-3" rows={3} placeholder="Description" />
                <input value={profileForm.generalArea} onChange={(e) => setProfileForm({ ...profileForm, generalArea: e.target.value })} className="w-full border border-[#E4D9C3] rounded-xl px-4 py-3" placeholder="Area" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={profileForm.locationVisible} onChange={(e) => setProfileForm({ ...profileForm, locationVisible: e.target.checked })} />
                  Make precise coordinates visible to customers
                </label>
                <button className="w-full bg-[#3F6D4E] text-white rounded-full py-3 font-semibold">Save profile</button>
              </div>
            </form>
            <ProductManager products={ownProducts} onCreate={createProduct} onUpdate={updateProduct} onDelete={deleteProduct} />
          </section>
        )}

        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[#3F6D4E] text-sm font-semibold mb-2">Backend-powered discovery</p>
              <h2 className="font-['Fraunces',_Georgia,_serif] text-3xl">Vendors</h2>
              {exploredIds.size > 0 && <p className="mt-2 text-xs font-semibold text-[#3F6D4E]">🏅 {exploredIds.size} vendor profiles explored</p>}
            </div>
            <select value={connectionStatus} onChange={(e) => setConnectionStatus(e.target.value)} className="bg-white border border-[#E4D9C3] rounded-full px-4 py-2 text-xs">
              <option value="online">4G/5G</option>
              <option value="low-data">2G low-data mode</option>
            </select>
          </div>

          {loading ? (
            <div className="bg-white border border-[#E4D9C3] rounded-2xl p-10 text-center">Loading vendors…</div>
          ) : vendors.length === 0 ? (
            <div className="bg-white border border-[#E4D9C3] rounded-2xl p-10 text-center text-[#2B2118]/60">No vendors matched that search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onOpen={openVendor}
                  onAudio={speakVendor}
                  audioPlaying={isAudioPlaying}
                />
              ))}
            </div>
          )}
        </section>

        {selectedVendor && (
          <section className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
            <div className="bg-white border border-[#E4D9C3] rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-[#3F6D4E] font-semibold">{selectedVendor.verificationStatus}</p>
                  <h2 className="font-['Fraunces',_Georgia,_serif] text-3xl">{selectedVendor.businessName}</h2>
                  <p className="text-sm text-[#2B2118]/60 mt-1">{selectedVendor.generalArea}</p>
                </div>
                <button onClick={() => setSelectedVendor(null)} className="text-sm text-[#2B2118]/50">Close</button>
              </div>
              <p className="mt-4 text-sm text-[#2B2118]/70">{selectedVendor.description || 'No description yet.'}</p>
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-[#F4E9D3] rounded-xl p-4"><p className="text-xs">Trust</p><p className="font-bold text-xl">{Number(selectedVendor.trustScore || 0).toFixed(1)}</p></div>
                <div className="bg-[#DCE7DD] rounded-xl p-4"><p className="text-xs">Reviews</p><p className="font-bold text-xl">{selectedVendor.reviewCount}</p></div>
                <div className="bg-[#F3E2DA] rounded-xl p-4"><p className="text-xs">Views</p><p className="font-bold text-xl">{selectedVendor.profileViewCount}</p></div>
              </div>

              <h3 className="font-['Fraunces',_Georgia,_serif] text-xl mt-8 mb-3">Products</h3>
              {products.length === 0 ? <p className="text-sm text-[#2B2118]/50">No products listed yet.</p> : (
                <div className="space-y-3">
                  {products.filter((p) => p.available).map((product) => (
                    <div key={product.id} className="border-t border-[#E4D9C3] pt-3 flex justify-between gap-4">
                      <div><p className="font-semibold">{product.name}</p><p className="text-xs text-[#2B2118]/60">{product.description}</p></div>
                      <span className="font-semibold whitespace-nowrap">R{product.price ?? '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E4D9C3] rounded-2xl p-6">
              <h3 className="font-['Fraunces',_Georgia,_serif] text-2xl">Customer reviews</h3>
              <div className="mt-4 space-y-3 max-h-72 overflow-auto">
                {reviews.length === 0 && <p className="text-sm text-[#2B2118]/50">No reviews yet.</p>}
                {reviews.map((item) => (
                  <div key={item.id} className="border-b border-[#E4D9C3] pb-3">
                    <div className="flex justify-between"><strong className="text-sm">{item.customerName}</strong><span>⭐ {item.rating}/5</span></div>
                    <p className="text-sm text-[#2B2118]/70 mt-1">{item.comment}</p>
                  </div>
                ))}
              </div>
              {!isVendor && (
                <form onSubmit={submitReview} className="mt-6 space-y-3">
                  <select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })} className="w-full border border-[#E4D9C3] rounded-xl px-4 py-3">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}/5</option>)}
                  </select>
                  <textarea required maxLength={1000} value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} rows={3} placeholder="Share your experience" className="w-full border border-[#E4D9C3] rounded-xl px-4 py-3" />
                  <button className="w-full bg-[#3F6D4E] text-white rounded-full py-3 font-semibold">Submit review</button>
                </form>
              )}
            </div>
          </section>
        )}

        <section className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/checkout')} className="bg-[#C98A2C] text-[#1A140D] font-semibold px-6 py-3 rounded-full">Go to checkout</button>
          <button onClick={() => navigate('/')} className="border border-[#E4D9C3] bg-white px-6 py-3 rounded-full">Back home</button>
        </section>
      </main>
    </div>
  );
}
