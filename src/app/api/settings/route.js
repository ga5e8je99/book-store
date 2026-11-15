import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const settingsFilePath = path.join(process.cwd(), 'data', 'settings.json');

const getSettings = () => {
  try {
    if (!fs.existsSync(settingsFilePath)) {
      return {};
    }
    const data = fs.readFileSync(settingsFilePath, 'utf8');
    return JSON.parse(data || '{}');
  } catch (e) {
    return {};
  }
};

const saveSettings = (settings) => {
  fs.mkdirSync(path.dirname(settingsFilePath), { recursive: true });
  fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json(
      { status: 'success', data: { settings } },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const currentSettings = getSettings();
    const updated = {
      ...currentSettings,
      ...body,
      updatedAt: new Date().toISOString()
    };
    saveSettings(updated);

    return NextResponse.json(
      { status: 'success', message: 'Settings updated successfully', data: { settings: updated } },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

