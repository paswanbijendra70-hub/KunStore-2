export type AppData = {
  id: string;
  name: string;
  developer: string;
  rating: number;
  icon: string;
  category: string;
  downloads: string;
  description?: string;
  banner?: string;
};

export const featuredApp: AppData = {
  id: 'featured-1',
  name: 'Genshin Impact',
  developer: 'COGNOSPHERE PTE. LTD.',
  rating: 4.8,
  icon: 'https://play-lh.googleusercontent.com/So91qs_eRRrati6kxMACsCjnGOO4ExhH_P7UeB30cZ0o3Uj5q1n63-w0rP8K_h2fC8Y=w240-h480-rw',
  category: 'Adventure',
  downloads: '50M+',
  description: 'Step into Teyvat, a vast world teeming with life and flowing with elemental energy.',
  banner: 'https://play-lh.googleusercontent.com/B948G-P2B743Z44Ff7B-0W3A7b-2Gv0a74L77Bq30y-3G07q23xQ5_8q3tZ0_zW_Q2w=w1920-h1080-rw',
};

export const latestApps: AppData[] = [
  {
    id: 'app-1',
    name: 'WhatsApp Messenger',
    developer: 'WhatsApp LLC',
    rating: 4.3,
    icon: 'https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2ZzEnxFE150K2w303B1_xR4x888rK9k_0W2Wq_gY5y3q6pX3g=w240-h480-rw',
    category: 'Communication',
    downloads: '5B+',
  },
  {
    id: 'app-2',
    name: 'Instagram',
    developer: 'Instagram',
    rating: 4.0,
    icon: 'https://play-lh.googleusercontent.com/VRMWkE5p3CkWhJs6nv-9ZsLAs1QOg5_T-u-tF5y4G-82Oq-0A-04E9u-89W6gD_s0A=w240-h480-rw',
    category: 'Social',
    downloads: '1B+',
  },
  {
    id: 'app-3',
    name: 'TikTok',
    developer: 'TikTok Pte. Ltd.',
    rating: 4.4,
    icon: 'https://play-lh.googleusercontent.com/bdUeF_t8T-g_k33_nC9_4tB_8M8_4X-4O0x_4e8x8-G9_3U_0u_g8M7Z_2b_c4q_r78=w240-h480-rw',
    category: 'Video Players & Editors',
    downloads: '1B+',
  },
  {
    id: 'app-4',
    name: 'CapCut - Video Editor',
    developer: 'Bytedance Pte. Ltd.',
    rating: 4.5,
    icon: 'https://play-lh.googleusercontent.com/cRvt0u8QxZ_0o33r_0o80Q5G_4V_5R_6K_3K_4K_3K_4K_3K_4K_3K_4K_3K_4K=w240-h480-rw',
    category: 'Video Players & Editors',
    downloads: '500M+',
  },
  {
    id: 'app-5',
    name: 'Spotify: Music and Podcasts',
    developer: 'Spotify AB',
    rating: 4.4,
    icon: 'https://play-lh.googleusercontent.com/P2VMEenhpIsubG2n0bvwz41G-4L403b9t7QZ96-9t3-31P841315-99w4-00x4-00x4=w240-h480-rw',
    category: 'Music & Audio',
    downloads: '1B+',
  },
  {
    id: 'app-6',
    name: 'Netflix',
    developer: 'Netflix, Inc.',
    rating: 4.3,
    icon: 'https://play-lh.googleusercontent.com/TBRwjS_qfJcM_4v33g4v_3b_2Z8u_99M331908_94300_84323_2433_2003_1=w240-h480-rw',
    category: 'Entertainment',
    downloads: '1B+',
  }
];

export const topGames: AppData[] = [
  {
    id: 'game-1',
    name: 'PUBG MOBILE',
    developer: 'Level Infinite',
    rating: 4.2,
    icon: 'https://play-lh.googleusercontent.com/T0b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b=w240-h480-rw',
    category: 'Action',
    downloads: '500M+',
  },
  {
    id: 'game-2',
    name: 'Roblox',
    developer: 'Roblox Corporation',
    rating: 4.4,
    icon: 'https://play-lh.googleusercontent.com/WNWZaxo9IqEzjxO0_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b=w240-h480-rw',
    category: 'Adventure',
    downloads: '500M+',
  },
  {
    id: 'game-3',
    name: 'Subway Surfers',
    developer: 'SYBO Games',
    rating: 4.6,
    icon: 'https://play-lh.googleusercontent.com/4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b=w240-h480-rw',
    category: 'Arcade',
    downloads: '1B+',
  },
  {
    id: 'game-4',
    name: 'Candy Crush Saga',
    developer: 'King',
    rating: 4.6,
    icon: 'https://play-lh.googleusercontent.com/3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b=w240-h480-rw',
    category: 'Casual',
    downloads: '1B+',
  },
  {
    id: 'game-5',
    name: 'Free Fire',
    developer: 'Garena International I',
    rating: 4.1,
    icon: 'https://play-lh.googleusercontent.com/4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b=w240-h480-rw',
    category: 'Action',
    downloads: '1B+',
  },
  {
    id: 'game-6',
    name: 'Clash of Clans',
    developer: 'Supercell',
    rating: 4.5,
    icon: 'https://play-lh.googleusercontent.com/3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b_4b_3b=w240-h480-rw',
    category: 'Strategy',
    downloads: '500M+',
  }
];
