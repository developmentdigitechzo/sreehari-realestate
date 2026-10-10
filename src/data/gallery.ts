export interface GalleryItem {
  id: string;
  title: string;
  category: 'Gated Layouts' | 'Infrastructure & Roads' | 'Entrance Arches' | 'Greenery & Parks' | 'Site Ceremonies';
  image: string;
  project: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Emerald Greens - 40ft Wide Blacktop Avenue',
    category: 'Infrastructure & Roads',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    project: 'Emerald Greens Grand Enclave'
  },
  {
    id: '2',
    title: 'Lotus Serenity - Tree-lined Internal Lanes',
    category: 'Greenery & Parks',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    project: 'Lotus Serenity Gardens'
  },
  {
    id: '3',
    title: 'Sree Hari Prime - Grand Entry Archway & Gatehouse',
    category: 'Entrance Arches',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    project: 'Sree Hari Prime Avenue'
  },
  {
    id: '4',
    title: 'Surveyed & Demarcated Plot Boundaries',
    category: 'Gated Layouts',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    project: 'Greenfield Valley Extension'
  },
  {
    id: '5',
    title: 'Solar Powered LED Street Lighting Network',
    category: 'Infrastructure & Roads',
    image: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80',
    project: 'Lotus Serenity Gardens'
  },
  {
    id: '6',
    title: 'Landscaped Children Play Area & Open Green Reserve',
    category: 'Greenery & Parks',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    project: 'Emerald Greens Grand Enclave'
  },
  {
    id: '7',
    title: 'Customer Bhoomi Pooja & Site Handover Gathering',
    category: 'Site Ceremonies',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    project: 'Sree Hari Royal Enclave'
  },
  {
    id: '8',
    title: 'Compounded Perimeter Security Wall Construction',
    category: 'Gated Layouts',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    project: 'Sree Hari Prime Avenue'
  }
];
