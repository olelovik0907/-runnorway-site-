import React, { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setMessage('Takk for påmeldingen! Vi holder deg oppdatert.');
      setEmail('');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <footer
      className="py-12 text-white text-center"
      style={{ background: '#0b4f4d', borderTop: '1px solid rgba(15,23,42,0.25)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto px-4 flex gap-2 justify-center mb-4"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@epost.no"
          className="w-full max-w-xs px-3 py-2 rounded-lg text-slate-900"
        />
        <button type="submit" className="btn-brand rounded-lg px-4 py-2 font-semibold">
          Meld meg på
        </button>
      </form>
      {message && <p className="text-white/90 mb-4">{message}</p>}
      <p className="text-white/90">© {new Date().getFullYear()} RunNorway</p>
    </footer>
  );
}
