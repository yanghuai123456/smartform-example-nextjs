'use client';
import { useState } from 'react';
import { submitContact } from './actions';

export default function Page() {
  const [status, setStatus] = useState<string>('');

  async function onSubmit(formData: FormData) {
    setStatus('Sending…');
    try {
      const data = await submitContact(formData);
      setStatus(`Sent! submission_id=${data.submission_id} intent=${data.intent}`);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  }

  return (
    <main style={{ font: '16px/1.4 system-ui', maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
      <h1>Contact us</h1>
      <form action={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input name="name"  placeholder="Name"  required />
        <input name="email" type="email" placeholder="Email" required />
        <textarea name="message" placeholder="Message" required style={{ minHeight: 100 }} />
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off"
               style={{ position: 'absolute', left: -9999 }} aria-hidden />
        <button type="submit" style={{ background: '#7c3aed', color: '#fff', border: 0, padding: '8px 10px' }}>
          Send
        </button>
        <p>{status}</p>
      </form>
    </main>
  );
}
