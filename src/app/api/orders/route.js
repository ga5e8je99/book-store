import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    let ids = searchParams.get('ids')?.split(',').filter(Boolean);
    let action = searchParams.get('action');

    const body = await request.json().catch(() => ({}));
    if (body.id) id = body.id;
    if (body.ids && Array.isArray(body.ids)) ids = body.ids;
    if (body.action) action = body.action;

    let orders = getPayments();

    if (action === 'clear_tests') {
      // Keep only orders with real orderId format (like ORD-777888) or created with items/cod
      const beforeCount = orders.length;
      orders = orders.filter((o) => o.orderId && o.items && o.items.length > 0);
      savePayments(orders);
      return NextResponse.json(
        {
          status: 'success',
          message: `Cleared ${beforeCount - orders.length} test records.`,
          data: { remaining: orders.length }
        },
        { headers: corsHeaders }
      );
    }

    if (!id && (!ids || ids.length === 0)) {
      return NextResponse.json(
        { status: 'fail', message: 'Order ID or IDs are required for deletion' },
        { status: 400, headers: corsHeaders }
      );
    }

    const initialLen = orders.length;

    if (ids && ids.length > 0) {
      orders = orders.filter((o) => !ids.includes(o._id) && !ids.includes(o.id) && !ids.includes(o.orderId));
      savePayments(orders);
      return NextResponse.json(
        { status: 'success', message: `Deleted ${initialLen - orders.length} orders successfully` },
        { headers: corsHeaders }
      );
    }

    orders = orders.filter((o) => o._id !== id && o.id !== id && o.orderId !== id);

    if (orders.length === initialLen) {
      return NextResponse.json(
        { status: 'fail', message: 'Order not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    savePayments(orders);

    return NextResponse.json(
      { status: 'success', message: 'Order deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
