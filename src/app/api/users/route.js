import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

const getUsers = () => {
  try {
    if (!fs.existsSync(usersFilePath)) {
      return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
};

const saveUsers = (users) => {
  fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const rawUsers = getUsers();
    const safeUsers = rawUsers.map((u) => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });

    return NextResponse.json(
      { status: 'success', results: safeUsers.length, data: { users: safeUsers } },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { email, name, phone, address, city } = body;

    if (!email) {
      return NextResponse.json(
        { status: 'fail', message: 'User email is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const users = getUsers();
    const index = users.findIndex(
      (u) => (u.email || '').toLowerCase() === email.toLowerCase()
    );

    if (index === -1) {
      return NextResponse.json(
        { status: 'fail', message: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (name) users[index].name = name;
    if (phone !== undefined) users[index].phone = phone;
    if (address !== undefined) users[index].address = address;
    if (city !== undefined) users[index].city = city;
    users[index].updatedAt = new Date().toISOString();

    saveUsers(users);

    const safeUser = { ...users[index] };
    delete safeUser.password;

    return NextResponse.json(
      { status: 'success', message: 'Profile updated successfully', data: { user: safeUser } },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    let email = searchParams.get('email');
    let ids = searchParams.get('ids')?.split(',').filter(Boolean);
    let action = searchParams.get('action');

    const body = await request.json().catch(() => ({}));
    if (body.id) id = body.id;
    if (body.email) email = body.email;
    if (body.ids && Array.isArray(body.ids)) ids = body.ids;
    if (body.action) action = body.action;

    let users = getUsers();

    if (action === 'clear_test_users') {
      // Keep only accounts with real domains or the primary user account
      const beforeCount = users.length;
      users = users.filter((u) => !u.email.includes('@example.com') && !u.email.includes('@test.com'));
      saveUsers(users);
      return NextResponse.json(
        {
          status: 'success',
          message: `Cleared ${beforeCount - users.length} test user accounts.`,
          data: { remaining: users.length }
        },
        { headers: corsHeaders }
      );
    }

    if (!id && !email && (!ids || ids.length === 0)) {
      return NextResponse.json(
        { status: 'fail', message: 'User ID, Email, or IDs array is required for deletion' },
        { status: 400, headers: corsHeaders }
      );
    }

    const initialLen = users.length;

    if (ids && ids.length > 0) {
      users = users.filter((u) => !ids.includes(u._id) && !ids.includes(u.id) && !ids.includes(u.email));
      saveUsers(users);
      return NextResponse.json(
        { status: 'success', message: `Deleted ${initialLen - users.length} users successfully` },
        { headers: corsHeaders }
      );
    }

    users = users.filter((u) => {
      if (id && (u._id === id || u.id === id)) return false;
      if (email && (u.email || '').toLowerCase() === email.toLowerCase()) return false;
      return true;
    });

    if (users.length === initialLen) {
      return NextResponse.json(
        { status: 'fail', message: 'User account not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    saveUsers(users);

    return NextResponse.json(
      { status: 'success', message: 'User deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
