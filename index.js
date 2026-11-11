/**
 * api/index.js
 * Servidor Express para Vercel Serverless conectado al esquema 'talentbridge'.
 */
import express from 'express';
import cors from 'cors';
import { getSupabaseAdmin } from '../supabase.js';
import { env } from '../env.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    status: 'healthy',
    env: env.NODE_ENV,
    supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '',
  });
});

const getPlansHandler = async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ ok: true, data: data || [], plans: data || [] });
  } catch (err) {
    console.error('[GET plans]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};

app.get('/api/plans', getPlansHandler);
app.get('/api/subscriptions/plans', getPlansHandler);

app.get('/api/subscriptions/me', (req, res) => {
  res.json({
    ok: true,
    subscription: { plan_code: 'free', status: 'active' },
    data: { plan_code: 'free', status: 'active' }
  });
});

const getPlayersHandler = async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ ok: true, data: data || [], players: data || [], profiles: data || [] });
  } catch (err) {
    console.error('[GET players]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};

app.get('/api/players', getPlayersHandler);
app.get('/api/profiles', getPlayersHandler);

app.get('/api/videos', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ ok: true, data: data || [], videos: data || [] });
  } catch (err) {
    console.error('[GET videos]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const getOrgsHandler = async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ ok: true, data: data || [], organizations: data || [] });
  } catch (err) {
    console.error('[GET organizations]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};

app.get('/api/organizations', getOrgsHandler);
app.get('/api/orgs', getOrgsHandler);

export default app;
