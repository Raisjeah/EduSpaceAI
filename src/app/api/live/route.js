import { getSessionUser } from '@/lib/core/session';
import { NextResponse } from 'next/server';
import { getCachedPlan, getEffectivePlan, checkWindowUsage, getWindowUsage } from '@/lib/core/subscription';
import dbConnect from '@/lib/db/mongodb';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const planName = await getEffectivePlan(user);
  const planDoc = await getCachedPlan(planName);

  if (!planDoc?.live_call_enabled || planDoc.live_call_minutes_per_window === 0) {
    return NextResponse.json(
      { error: 'Fitur Live Call tidak tersedia di paket Anda. Upgrade untuk mengakses Prof. Kore.' },
      { status: 403 }
    );
  }

  // Cek window usage (tanpa increment — increment dilakukan saat sesi berakhir via POST)
  const { used, windowResetAt } = await getWindowUsage(
    user._id.toString(),
    'live_call',
    planDoc.live_call_window_hours
  );

  const remainingMinutes = planDoc.live_call_minutes_per_window - used;

  if (remainingMinutes <= 0) {
    return NextResponse.json(
      {
        error: `Batas waktu Live Call habis. Reset pada ${new Date(windowResetAt).toLocaleTimeString('id-ID')}.`,
        windowResetAt,
      },
      { status: 429 }
    );
  }

  const apiKey = process.env.GEMINI_LIVE_TOKEN || process.env.GEMINI_API_KEY_2;
  if (!apiKey) {
    return NextResponse.json({ error: 'Live token tidak dikonfigurasi.' }, { status: 503 });
  }

  // PENTING: Idealnya gunakan ephemeral token dari Gemini API, bukan raw key.
  // Lihat: https://ai.google.dev/gemini-api/docs/ephemeral-tokens
  // Untuk sementara, return token dengan remainingMinutes agar client bisa enforce di sisi UI juga.
  return NextResponse.json({
    token: apiKey,
    remainingMinutes,
    windowResetAt,
    planName,
  });
}

// Endpoint untuk melaporkan durasi sesi yang sudah digunakan
export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { minutesUsed } = await req.json();
  if (!minutesUsed || minutesUsed <= 0) {
    return NextResponse.json({ error: 'minutesUsed harus > 0' }, { status: 400 });
  }

  await dbConnect();
  const planName = await getEffectivePlan(user);
  const planDoc = await getCachedPlan(planName);

  if (!planDoc?.live_call_enabled) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await checkWindowUsage(
    user._id.toString(),
    'live_call',
    planDoc.live_call_window_hours,
    planDoc.live_call_minutes_per_window,
    Math.ceil(minutesUsed)
  );

  return NextResponse.json(result);
}
