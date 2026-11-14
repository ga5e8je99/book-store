import rawBooks from '../../data/books.json';

// Organize books by category/section
export const allBooks = rawBooks;

export const homeBooks = {
  handpicked: allBooks.filter((b) => b.category === 'Adventure' || b.category === 'Cooking' || b.category === 'History' || b.category === 'Mystery' || b.category === 'Fantasy' || b.category === 'Thriller').slice(0, 6),
  trending: allBooks.filter((b) => b.category === 'Best Seller' || b.category === 'Fiction' || b.category === 'Science' || b.category === 'Art & Design' || b.category === 'Dystopian').slice(0, 6),
  novels: allBooks.filter((b) => b.category === 'Novel' || b.category === 'Novels' || b.category === 'Story' || b.category === 'Drama').slice(0, 6)
};

export const categoryBooks = {
  story: allBooks.filter((b) => b.category === 'Novel' || b.category === 'Novels' || b.category === 'Story' || b.category === 'Drama'),
  science: allBooks.filter((b) => b.category === 'Science' || b.category === 'Science & Cosmos'),
  bestsaller: allBooks.filter((b) => b.category === 'Best Seller' || b.badge?.includes('Best')),
  newbook: allBooks.filter((b) => b.category === 'New Releases' || b.badge?.includes('New') || b.badge?.includes('Release'))
};
