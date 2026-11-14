import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

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

const saveLocalUsers = (users) => {
  fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { status: 'fail', success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const users = getLocalUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return NextResponse.json(
        { status: 'fail', success: false, message: 'Email is already registered' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: 'usr_' + Date.now(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveLocalUsers(users);

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || 'jwt-high-security-key',
      { expiresIn: '3d' }
    );

    const safeUser = { ...newUser };
    delete safeUser.password;

    const response = NextResponse.json(
      {
        status: 'success',
        success: true,
        token,
        data: { result: safeUser }
      },
      { status: 201 }
    );

    response.cookies.set('jwt', token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { status: 'error', success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

