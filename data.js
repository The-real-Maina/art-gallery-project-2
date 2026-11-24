// ARTWORK DATA
// To add a new artwork, add one object to ARTWORKS below.
// To add a new artist, add one object to ARTISTS first, then use its key in ARTWORKS.
// Every page (home, artists, lightbox, filter, search) updates automatically.

const ARTISTS = [
  { key: 'Jane', name: 'Jane Doe' },
  { key: 'John', name: 'John Smith' },
  { key: 'David', name: 'David Ochieng' }
];

const ARTWORKS = [
  {
    id: 1,
    title: 'Colours of Expression',
    artistKey: 'Jane',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500',
    featured: true
  },
  {
    id: 2,
    title: 'African Expressions',
    artistKey: 'John',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=500',
    featured: true
  },
  {
    id: 3,
    title: 'The Art of Stillness',
    artistKey: 'Jane',
    image: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=500',
    featured: true
  },
  {
    id: 4,
    title: 'Modern Perspectives',
    artistKey: 'David',
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500',
    featured: true
  }
];

// EXHIBITIONS (dates are YYYY-MM-DD; the status badge is worked out from today's date)
const EXHIBITIONS = [
  { name: 'African Expressions', artistKey: 'John', start: '2026-11-20', end: '2026-12-15', location: 'Main Hall' },
  { name: 'The Art of Stillness', artistKey: 'Jane', start: '2026-12-05', end: '2026-12-28', location: 'West Wing' },
  { name: 'Modern Perspectives', artistKey: 'David', start: '2027-01-10', end: '2027-02-10', location: 'East Gallery' }
];