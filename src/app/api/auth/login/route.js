import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

const createToken = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60 })
  ).toString('base64url');
  const secret = process.env.JWT_SECRET || 'jwt-high-security-key';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
};

const getLocalUsers = () => {
  try {
    if (!fs.existsSync(usersFilePath)) {
      fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
      fs.writeFileSync(usersFilePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { status: 'fail', success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    const users = getLocalUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { status: 'fail', success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { status: 'fail', success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = createToken({ id: user._id || user.id });

    const safeUser = { ...user };
    delete safeUser.password;

    const response = NextResponse.json({
      status: 'success',
      success: true,
      token,
      data: { result: safeUser }
    });

    response.cookies.set('jwt', token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { status: 'error', success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

