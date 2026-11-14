import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const booksFilePath = path.join(process.cwd(), 'data', 'books.json');

const getBooks = () => {
  try {
    if (!fs.existsSync(booksFilePath)) {
      return [];
    }
    const data = fs.readFileSync(booksFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
};

const saveBooks = (books) => {
  fs.mkdirSync(path.dirname(booksFilePath), { recursive: true });
  fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2));
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let books = getBooks();

    if (category && category !== 'All') {
      books = books.filter((b) => b.category?.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(
      { status: 'success', results: books.length, data: { books } },
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
    const { title, author, category, price, image, description, badge, stock } = body;

    if (!title || !price) {
      return NextResponse.json(
        { status: 'fail', message: 'Title and Price are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const books = getBooks();
    const newBook = {
      id: 'bk_' + Date.now(),
      title,
      author: author || 'Acclaimed Author',
      category: category || 'General',
      price: Number(price),
      rating: Number(body.rating) || 5.0,
      badge: badge || 'New',
      stock: Number(stock) || 50,
      image: image || '/image/30.png',
      description: description || 'A captivating addition to the bookstore catalog.',
      createdAt: new Date().toISOString()
    };

    books.unshift(newBook);
    saveBooks(books);

    return NextResponse.json(
      { status: 'success', message: 'Book created successfully', data: { book: newBook } },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'fail', message: 'Book ID is required for updating' },
        { status: 400, headers: corsHeaders }
      );
    }

    const books = getBooks();
    const index = books.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json(
        { status: 'fail', message: 'Book not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const updatedBook = {
      ...books[index],
      ...body,
      price: body.price !== undefined ? Number(body.price) : books[index].price,
      stock: body.stock !== undefined ? Number(body.stock) : books[index].stock,
      updatedAt: new Date().toISOString()
    };

    books[index] = updatedBook;
    saveBooks(books);

    return NextResponse.json(
      { status: 'success', message: 'Book updated successfully', data: { book: updatedBook } },
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

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { status: 'fail', message: 'Book ID is required for deletion' },
        { status: 400, headers: corsHeaders }
      );
    }

    let books = getBooks();
    const initialLen = books.length;
    books = books.filter((b) => b.id !== id);

    if (books.length === initialLen) {
      return NextResponse.json(
        { status: 'fail', message: 'Book not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    saveBooks(books);

    return NextResponse.json(
      { status: 'success', message: 'Book deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

