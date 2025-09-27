import { sql } from '@vercel/postgres';
import fetch from 'node-fetch';

async function ensureTables() {
  await sql`CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    target TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`;
  await sql`CREATE INDEX IF NOT EXISTS idx_otps_target ON otps(target);`;
}

export default async function handler(req, res) {
  try { await ensureTables(); } catch {}

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { action, email, phone, code } = req.body || {};
  const target = (email || '').trim() || (phone ? `tel:${String(phone).trim()}` : '');
  if (!action || !target) return res.status(400).json({ error: 'action and email or phone are required' });

  if (action === 'request') {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      // Clean existing non-consumed for target
      try { await sql`DELETE FROM otps WHERE target = ${target} AND consumed = FALSE;`; } catch {}
      await sql`INSERT INTO otps (target, code, expires_at, consumed) VALUES (${target}, ${otp}, ${expiresAt.toISOString()}, FALSE);`;
      // Optional: email delivery via Resend if available and an email target was provided
      const isEmail = target && !target.startsWith('tel:');
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const RESEND_FROM = process.env.RESEND_FROM || 'no-reply@cinerank.app';
      if (isEmail && RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: RESEND_FROM,
              to: target,
              subject: 'Your CineRank OTP',
              html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
            })
          });
        } catch {}
      }
      const payload = { ok: true };
      if (process.env.NODE_ENV !== 'production') payload.devCode = otp;
      return res.status(200).json(payload);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create OTP', detail: String(e?.message || e) });
    }
  }

  if (action === 'verify') {
    try {
      if (!code) return res.status(400).json({ error: 'code required' });
      const nowIso = new Date().toISOString();
      const result = await sql`SELECT id, code, expires_at, consumed FROM otps WHERE target = ${target} ORDER BY created_at DESC LIMIT 1;`;
      const row = result.rows?.[0];
      if (!row) return res.status(400).json({ error: 'No OTP requested' });
      if (row.consumed) return res.status(400).json({ error: 'OTP already used' });
      if (new Date(row.expires_at).toISOString() < nowIso) return res.status(400).json({ error: 'OTP expired' });
      if (String(row.code) !== String(code)) return res.status(400).json({ error: 'Invalid code' });
      await sql`UPDATE otps SET consumed = TRUE WHERE id = ${row.id};`;
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to verify OTP', detail: String(e?.message || e) });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}
