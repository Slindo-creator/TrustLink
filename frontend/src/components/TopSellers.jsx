import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

// Fallback used only if the backend can't be reached (e.g. this page is
// being viewed as a static preview without the Spring Boot API running).
// When the API responds, it fully replaces this list.
const fallbackSellers = [
  { rank: 1, name: 'Mama Thandi\u2019s Kota Corner', area: 'Khayelitsha', rating: 4.9, orders: 312 },
  { rank: 2, name: 'Bra Sipho Braai Spot', area: 'Soweto', rating: 4.8, orders: 287 },
  { rank: 3, name: 'Vetkoek Vibes', area: 'Mamelodi', rating: 4.7, orders: 241 },
];

function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`w-4 h-4 ${i < full ? 'fill-[#C98A2C]' : 'fill-[#E4D9C3]'}`}
        >
          <path d="M10 1.5l2.6 5.4 5.9.7-4.3 4.2 1 6-5.2-2.9-5.2 2.9 1-6L1.5 7.6l5.9-.7L10 1.5Z" />
        </svg>
      ))}
    </span>
  );
}

export default function TopSellers() {
  const [sellers, setSellers] = useState(fallbackSellers);
  const [isLive, setIsLive] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    let cancelled = false;
    // Live vendor data from the Spring API.
    api.vendors()
      .then((data) => {
        if (cancelled) return;
        setApiError('');
        if (!Array.isArray(data) || data.length === 0) return;
        setSellers(
          [...data]
            .sort((a, b) => Number(b.trustScore || 0) - Number(a.trustScore || 0))
            .slice(0, 3)
            .map((v, i) => ({
            rank: i + 1,
            name: v.businessName,
            area: v.generalArea,
            rating: v.trustScore,
            orders: v.reviewCount,
          }))
        );
        setIsLive(true);
      })
      .catch((err) => {
        if (!cancelled) setApiError(err.message || 'TrustLink API is unavailable.');
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sellers.map((s) => (
          <div
            key={s.rank}
            className={`relative bg-white border rounded-2xl p-6 ${
              s.rank === 1 ? 'border-[#C98A2C] shadow-[0_0_0_3px_rgba(201,138,44,0.15)]' : 'border-[#E4D9C3]'
            }`}
          >
            {s.rank === 1 && (
              <span className="absolute -top-3 left-6 bg-[#C98A2C] text-[#1A140D] text-xs font-semibold px-3 py-1 rounded-full">
                🔥 Vendor of the Month
              </span>
            )}
            <p className="text-xs font-semibold text-[#2B2118]/50 mb-2">#{s.rank} this month</p>
            <h3 className="font-['Fraunces',_Georgia,_serif] text-lg mb-1">{s.name}</h3>
            <p className="text-sm text-[#2B2118]/60 mb-3">{s.area}</p>
            <div className="flex items-center justify-between">
              <Stars rating={s.rating} />
              <span className="text-xs text-[#2B2118]/60">{s.orders} orders</span>
            </div>
          </div>
        ))}
      </div>
      {!isLive && (
        <p className="text-center text-xs text-[#B8543A] mt-6">
          {apiError || 'No live vendor data is available yet. Start the TrustLink API to populate this section.'}
        </p>
      )}
    </div>
  );
}
