import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    await sql`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      username TEXT UNIQUE,
      age_category TEXT,
      genres JSONB DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`;
  } catch (e) {
    // ignore if fails due to permissions; Neon usually allows CREATE IF NOT EXISTS
  }

  if (req.method === 'POST') {
    try {
      const { id, name, email, phone, username, age_category, genres } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const result = await sql`INSERT INTO users (id, name, email, phone, username, age_category, genres, updated_at)
        VALUES (${id}, ${name || null}, ${email || null}, ${phone || null}, ${username || null}, ${age_category || null}, ${JSON.stringify(genres || [])}::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          username = EXCLUDED.username,
          age_category = EXCLUDED.age_category,
          genres = EXCLUDED.genres,
          updated_at = NOW()
        RETURNING id, name, email, phone, username, age_category, genres;`;
      return res.status(200).json(result.rows[0]);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to upsert user', detail: String(e?.message || e) });
    }
  }

  if (req.method === 'GET') {
    try {
      const { id, email, username } = req.query || {};
      if (!id && !email && !username) return res.status(400).json({ error: 'id or email or username required' });
      const result = id
        ? await sql`SELECT id, name, email, phone, username, age_category, genres FROM users WHERE id = ${id} LIMIT 1;`
        : (username
            ? await sql`SELECT id, name, email, phone, username, age_category, genres FROM users WHERE username = ${username} LIMIT 1;`
            : await sql`SELECT id, name, email, phone, username, age_category, genres FROM users WHERE email = ${email} LIMIT 1;`
          );
      return res.status(200).json(result.rows[0] || null);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch user', detail: String(e?.message || e) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
