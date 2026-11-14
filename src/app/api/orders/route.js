import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const paymentsFilePath = path.join(process.cwd(), 'data', 'payments.json');

const getPayments = () => {
  try {
    if (!fs.existsSync(paymentsFilePath)) {
      return [];
    }
    const data = fs.readFileSync(paymentsFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
};

const savePayments = (payments) => {
  fs.mkdirSync(path.dirname(paymentsFilePath), { recursive: true });
  fs.writeFileSync(paymentsFilePath, JSON.stringify(payments, null, 2));
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const orderId = searchParams.get('orderId');

    let orders = getPayments();

    if (email) {
      const q = email.toLowerCase().trim();
      orders = orders.filter((o) => {
        const oEmail = (o.customerEmail || o.email || '').toLowerCase().trim();
        const oName = (o.customerName || o.cardName || '').toLowerCase().trim();
        return oEmail === q || oName === q;
      });
    }

    if (orderId) {
      const q = orderId.toLowerCase().trim();
      orders = orders.filter((o) => {
        const id = (o.orderId || o._id || o.id || '').toLowerCase();
        return id.includes(q);
      });
    }

    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return NextResponse.json(
      { status: 'success', results: orders.length, data: { orders } },
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { status: 'fail', message: 'Order ID and new status are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const orders = getPayments();
    const index = orders.findIndex((o) => o._id === id || o.id === id || o.orderId === id);

    if (index === -1) {
      return NextResponse.json(
        { status: 'fail', message: 'Order not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();
    savePayments(orders);

    return NextResponse.json(
      { status: 'success', message: 'Order status updated', data: { order: orders[index] } },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
