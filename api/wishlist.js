import { sql } from '@vercel/postgres';

async function ensureTables() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE
  );`;
  await sql`CREATE TABLE IF NOT EXISTS wishlist (
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    title TEXT,
    poster TEXT,
    year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`;
}

export default async function handler(req, res) {
  try { await ensureTables(); } catch {}

  const { userId } = req.method === 'GET' ? req.query : req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  if (req.method === 'GET') {
    try {
      const result = await sql`SELECT item_id as id, title, poster, year FROM wishlist WHERE user_id = ${userId} ORDER BY created_at DESC;`;
      return res.status(200).json(result.rows);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch wishlist', detail: String(e?.message || e) });
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, title, poster, year } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`INSERT INTO wishlist (user_id, item_id, title, poster, year)
        VALUES (${userId}, ${id}, ${title || null}, ${poster || null}, ${year || null})
        ON CONFLICT (user_id, item_id) DO UPDATE SET title = EXCLUDED.title, poster = EXCLUDED.poster, year = EXCLUDED.year;`;
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to upsert wishlist item', detail: String(e?.message || e) });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM wishlist WHERE user_id = ${userId} AND item_id = ${id};`;
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to delete wishlist item', detail: String(e?.message || e) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end('Method Not Allowed');
}
