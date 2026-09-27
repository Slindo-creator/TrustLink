import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PriceCalculator from '../components/PriceCalculator';

const STEPS = ['Cart', 'Estimate', 'Pay'];

// Uber-Eats-style checkout: review order -> see a fair-price estimate
// (this is where the price calculator now lives, instead of sitting on the
// homepage) -> confirm payment.
export default function Checkout() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5EFE3] text-[#2B2118] font-['Inter',_system-ui,_sans-serif]">
      <header className="px-6 lg:px-10 h-16 flex items-center justify-between border-b border-[#E4D9C3]">
        <Link to="/dashboard" className="text-sm text-[#2B2118]/70">← Back to browsing</Link>
        <span className="font-['Fraunces',_Georgia,_serif] text-lg">Checkout</span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center gap-3 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= step ? 'bg-[#2B2118] text-[#F5EFE3]' : 'bg-[#E4D9C3] text-[#2B2118]/50'
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-sm ${i <= step ? 'text-[#2B2118]' : 'text-[#2B2118]/40'}`}>{s}</span>
              {i < STEPS.length - 1 && <span className="w-8 h-px bg-[#E4D9C3]" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="bg-white border border-[#E4D9C3] rounded-2xl p-6">
            <h2 className="font-['Fraunces',_Georgia,_serif] text-xl mb-4">Your order</h2>
            <p className="text-sm text-[#2B2118]/60 mb-6">
              Order items are pulled in from the vendor's product list. Confirm what you're getting before we
              show you a fair-price estimate.
            </p>
            <button
              onClick={() => setStep(1)}
              className="bg-[#C98A2C] text-[#1A140D] font-semibold text-sm px-6 py-3 rounded-full"
            >
              Continue to price estimate
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-center text-sm text-[#2B2118]/70 mb-6">
              Pick what you're ordering to see a fair local price before you pay — if the vendor is quoting well
              above this, check their trust profile first.
            </p>
            <PriceCalculator />
            <button
              onClick={() => setStep(2)}
              className="mt-6 w-full bg-[#C98A2C] text-[#1A140D] font-semibold text-sm px-6 py-3 rounded-full"
            >
              Looks good, continue to payment
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-[#E4D9C3] rounded-2xl p-6 text-center">
            <h2 className="font-['Fraunces',_Georgia,_serif] text-xl mb-4">Payment</h2>
            <p className="text-sm text-[#2B2118]/60 mb-6">
              This is where your payment provider (card, SnapScan, EFT, cash-on-collect) plugs in.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#3F6D4E] text-white font-semibold text-sm px-6 py-3 rounded-full"
            >
              Confirm order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
