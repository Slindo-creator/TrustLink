import React, { useState } from 'react';
import { getSession } from '../lib/session';

// Starting list — in production this comes from a vacancies table on the
// backend (not built yet: would need its own entity/endpoint alongside
// Product/VendorProfile), keyed to the posting vendor's profile.
const initialVacancies = [
  { role: 'Braai Assistant', vendor: 'Bra Sipho Braai Spot', area: 'Soweto', type: 'Part-time' },
  { role: 'Delivery Rider (bicycle)', vendor: 'Mama Thandi\u2019s Kota Corner', area: 'Khayelitsha', type: 'Flexible hours' },
  { role: 'Weekend Cashier', vendor: 'Vetkoek Vibes', area: 'Mamelodi', type: 'Weekends' },
];

const VACANCY_TYPES = ['Part-time', 'Full-time', 'Weekends', 'Flexible hours'];

export default function VendorVacancies() {
  const [vacancies, setVacancies] = useState(initialVacancies);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ role: '', area: '', type: VACANCY_TYPES[0], description: '' });
  const session = getSession();
  const isVendor = session?.role === 'VENDOR';

  function handleSubmit(e) {
    e.preventDefault();
    // Required fields — role, area, type and a short description of what the job needs.
    if (!form.role.trim() || !form.area.trim() || !form.description.trim()) return;
    setVacancies((prev) => [
      { ...form, vendor: session?.vendorProfile?.businessName || session?.name || 'Your business' },
      ...prev,
    ]);
    setForm({ role: '', area: '', type: VACANCY_TYPES[0], description: '' });
    setShowForm(false);
  }

  return (
    <div>
      {isVendor && (
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-[#3F6D4E] text-white text-sm font-semibold px-6 py-3 rounded-full"
          >
            {showForm ? 'Cancel' : '+ Post a vacancy'}
          </button>
        </div>
      )}

      {isVendor && showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#E4D9C3] rounded-2xl p-6 mb-8 grid gap-4 max-w-xl mx-auto">
          <label className="text-sm">
            <span className="text-[#2B2118]/70">Role *</span>
            <input
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1 w-full border border-[#E4D9C3] rounded-lg px-3 py-2"
              placeholder="e.g. Braai Assistant"
            />
          </label>
          <label className="text-sm">
            <span className="text-[#2B2118]/70">Area *</span>
            <input
              required
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="mt-1 w-full border border-[#E4D9C3] rounded-lg px-3 py-2"
              placeholder="e.g. Soweto"
            />
          </label>
          <label className="text-sm">
            <span className="text-[#2B2118]/70">Type *</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 w-full border border-[#E4D9C3] rounded-lg px-3 py-2 bg-white"
            >
              {VACANCY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-[#2B2118]/70">What does the job involve? *</span>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full border border-[#E4D9C3] rounded-lg px-3 py-2"
              rows={3}
            />
          </label>
          <button type="submit" className="bg-[#C98A2C] text-[#1A140D] font-semibold text-sm py-3 rounded-full">
            Post vacancy
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {vacancies.map((v) => (
          <div key={`${v.role}-${v.vendor}`} className="bg-white border border-[#E4D9C3] rounded-2xl p-6 flex flex-col">
            <span className="inline-flex w-fit items-center text-xs font-semibold text-[#3F6D4E] bg-[#DCE7DD] px-3 py-1 rounded-full mb-4">
              {v.type}
            </span>
            <h3 className="font-['Fraunces',_Georgia,_serif] text-lg mb-1">{v.role}</h3>
            <p className="text-sm text-[#2B2118]/70">{v.vendor}</p>
            <p className="text-xs text-[#2B2118]/50 mt-1 mb-5">{v.area}</p>
            <a
              href="#contact"
              className="mt-auto text-sm font-semibold text-[#C98A2C] hover:text-[#B77A22] transition"
            >
              Enquire on WhatsApp →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
