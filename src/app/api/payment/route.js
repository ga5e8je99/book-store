import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const paymentsFilePath = path.join(process.cwd(), 'data', 'payments.json');

const getLocalPayments = () => {
  try {
    if (!fs.existsSync(paymentsFilePath)) {
      fs.mkdirSync(path.dirname(paymentsFilePath), { recursive: true });
      fs.writeFileSync(paymentsFilePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(paymentsFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
};

const saveLocalPayments = (payments) => {
  fs.mkdirSync(path.dirname(paymentsFilePath), { recursive: true });
  fs.writeFileSync(paymentsFilePath, JSON.stringify(payments, null, 2));
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    let payments = getLocalPayments();

    if (email) {
      payments = payments.filter((p) => {
        const pEmail = (p.customerEmail || p.email || '').toLowerCase();
        const pName = (p.customerName || p.cardName || '').toLowerCase();
        const target = email.toLowerCase();
        return pEmail === target || pName === target;
      });
    }

    if (orderId) {
      payments = payments.filter((p) => {
        const id = (p.orderId || p._id || p.id || '').toLowerCase();
        return id.includes(orderId.toLowerCase());
      });
    }

    // Sort newest first
    payments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return NextResponse.json(
      { status: 'success', count: payments.length, data: { orders: payments } },
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
    const {
      cardNumber,
      expiryDate,
      cardName,
      customerName,
      customerEmail,
      email,
      phone,
      address,
      city,
      items,
      paymentMethod = 'card'
    } = body;

    const amount = Number(body.amount || body.price || 0);
    const orderRef = body.orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    let maskedCard = null;
    if (paymentMethod === 'card') {
      const cleanCard = (cardNumber || '').replace(/\s+/g, '');
      maskedCard = '****-****-****-' + (cleanCard.slice(-4) || '4242');
    } else if (paymentMethod === 'cod') {
      maskedCard = 'Cash on Delivery (COD)';
    } else {
      maskedCard = 'PayPal Express';
    }

    const payments = getLocalPayments();

    const newOrder = {
      _id: 'ord_' + Date.now(),
      orderId: orderRef,
      cardNumber: maskedCard,
      cardName: customerName || cardName || 'Valued Customer',
      customerName: customerName || cardName || 'Valued Customer',
      customerEmail: customerEmail || email || '',
      phone: phone || '',
      shippingAddress: {
        address: address || '',
        city: city || ''
      },
      items: Array.isArray(items) ? items : [],
      itemsCount: Array.isArray(items) ? items.reduce((sum, it) => sum + (it.quantity || 1), 0) : (body.itemsCount || 1),
      amount,
      paymentMethod, // 'cod' | 'card' | 'paypal'
      status: 'processing', // 'processing' | 'shipped' | 'delivered' | 'cancelled'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    payments.push(newOrder);
    saveLocalPayments(payments);

    return NextResponse.json(
      {
        status: 'success',
        success: true,
        message: paymentMethod === 'cod' 
          ? 'Cash on delivery order placed successfully' 
          : 'Payment processed successfully',
        data: { result: newOrder, order: newOrder }
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error('Payment error:', err);
    return NextResponse.json(
      { status: 'error', success: false, message: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
