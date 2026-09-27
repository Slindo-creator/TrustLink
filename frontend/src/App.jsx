import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import TrustLinkDashboard from './pages/TrustLinkDashboard.jsx';
import SignIn from './pages/SignIn.jsx';
import Checkout from './pages/Checkout.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/dashboard" element={<TrustLinkDashboard />} />
      <Route path="/checkout" element={<Checkout />} />
      {/* Anything unrecognised still lands somewhere useful instead of a dead link */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
