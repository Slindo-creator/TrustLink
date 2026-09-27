import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';



function isLocalUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
  } catch {
    return true;
  }
}

export default function ShareQR({ url: urlProp }) {
  const defaultUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const [url, setUrl] = useState(urlProp || defaultUrl);
  const [dataUrl, setDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const local = isLocalUrl(url);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width: 220,
      margin: 1,
      color: { dark: '#2B2118', light: '#FFFFFF' },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [url]);

  function copyLink() {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="inline-flex flex-col items-center gap-3 bg-white border border-[#E4D9C3] rounded-2xl p-5 max-w-[260px]">
      {dataUrl ? (
        <img src={dataUrl} alt="QR code linking to TrustLink" width={160} height={160} className="rounded-lg" />
      ) : (
        <div className="w-40 h-40 rounded-lg bg-[#F4E9D3] animate-pulse" aria-hidden="true" />
      )}

      <p className="text-xs text-[#2B2118]/60 text-center">Scan to open TrustLink — no app, no install.</p>

      {local && (
        <div className="w-full text-xs bg-[#F3E2DA] text-[#8A4A32] rounded-lg px-3 py-2 text-center">
          This is a local dev link — a phone off this network can&apos;t reach it. Deploy the site
          (e.g. to Netlify) and paste the live link below to get a working code.
        </div>
      )}

      <label className="w-full text-xs">
        <span className="sr-only">Link this QR code opens</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-site.netlify.app"
          className="w-full border border-[#E4D9C3] rounded-lg px-2.5 py-1.5 text-xs"
        />
      </label>

      <button
        type="button"
        onClick={copyLink}
        className="w-full text-xs font-semibold py-2 rounded-full border border-[#2B2118]/20 hover:border-[#2B2118]/50 transition"
      >
        {copied ? 'Copied ✓' : 'Copy link instead'}
      </button>
    </div>
  );
}
