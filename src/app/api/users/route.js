import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
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
