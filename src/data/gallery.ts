export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  project: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Park Avenue - Grand Entrance Arch & Avenue Roads',
    category: 'DTCP & TNRERA Approved',
    image: '/project_park_avenue_new.jpg',
    project: 'Park Avenue'
  },
  {
    id: '2',
    title: 'Sri Amman Nagar - Gated Township in Thiruverumbur',
    category: '100% Sold Out Landmark',
    image: '/project_sri_amman_nagar_new.jpg',
    project: 'Sri Amman Nagar'
  },
  {
    id: '3',
    title: 'Aishwarya Nagar - Completed Township near BHEL',
    category: 'Completed & Handed Over',
    image: '/project_aishwarya_nagar.jpg',
    project: 'Aishwarya Nagar'
  }
];
