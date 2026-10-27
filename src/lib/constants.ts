import { Listing, CaptureReferral, PartnerSettings } from '../types';

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'listing-nbo-01',
    title: 'Modern 2-Bedroom Haven with Balcony',
    title_sw: 'Ghorofa ya Kisasa ya Vyumba 2 yenye Balkoni',
    description: 'Bright and airy apartment in Westlands, Nairobi. Master ensuite with fitted wardrobes, high-speed fiber internet, borehole water backup, and dedicated parking.',
    description_sw: 'Ghorofa yenye hewa safi na mwanga Westlands, Nairobi. Chumba kikuu kina choo ndani, kabati za kisasa, maji ya kuchimba, na eneo la gari.',
    rent_ksh: 45000,
    deposit_ksh: 45000,
    bedrooms: 2,
    bathrooms: 2,
    property_type: 'Apartment',
    city: 'Nairobi',
    neighborhood: 'Westlands',
    location_coordinates: { lat: -1.2673, lng: 36.8115, x: 48, y: 55 },
    photos: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Borehole Water', 'Backup Generator', 'High-Speed Internet', '24/7 Security Guards', 'Balcony', 'Parking Slot'],
    owner_id: 'landlord-kimani',
    owner_name: 'David Kimani (Landlord)',
    owner_phone: '+254 722 100 200',
    is_verified_listing: true,
    featured: true,

    // Phase 1 Viewora Tour
    tour_url: 'https://app.viewora.software/tours/westlands-haven-360',
    tour_provider: 'viewora',
    tour_verified: true,
    tour_added_at: '2026-10-15T09:00:00Z',
    tour_poster_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'listing-nbo-02',
    title: 'Spacious 1-Bedroom Executive Suite',
    title_sw: 'Ghorofa ya Chumba 1 ya Kifahari',
    description: 'Chic urban retreat along Dennis Pritt Road, Kilimani. Walking distance to Yaya Centre and Adlife Plaza. Gym and rooftop terrace access included.',
    description_sw: 'Makazi ya kifahari kando ya Barabara ya Dennis Pritt, Kilimani. Mwendo wa miguu hadi Yaya Centre. Kuna jimu na mtaro wa ghorofani.',
    rent_ksh: 38000,
    deposit_ksh: 38000,
    bedrooms: 1,
    bathrooms: 1,
    property_type: 'Apartment',
    city: 'Nairobi',
    neighborhood: 'Kilimani',
    location_coordinates: { lat: -1.2921, lng: 36.7845, x: 46, y: 56 },
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Gym Access', 'Rooftop Lounge', 'CCTV Surveillance', 'Solar Water Heating', 'Elevator'],
    owner_id: 'agent-wambui',
    owner_name: 'Wambui Properties Agent',
    owner_phone: '+254 733 456 789',
    is_verified_listing: true,

    // Viewora Tour link
    tour_url: 'https://viewora.software/tours/kilimani-executive-suite',
    tour_provider: 'viewora',
    tour_verified: true,
    tour_added_at: '2026-10-18T14:30:00Z',
    tour_poster_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'listing-nbo-03',
    title: 'Affordable Cozy Bedsitter near TRM',
    title_sw: 'Bedsitter Nafuu Karibu na TRM',
    description: 'Neat student & young professional bedsitter in Roysambu off Thika Road. Constant water supply, token meter, secure perimeter fence.',
    description_sw: 'Bedsitter safi sana kwa wanafunzi na vijana wafanyakazi Roysambu karibu na Thika Road. Maji tele, stima ya token, ulinzi thabiti.',
    rent_ksh: 14000,
    deposit_ksh: 14000,
    bedrooms: 0,
    bathrooms: 1,
    property_type: 'Bedsitter',
    city: 'Nairobi',
    neighborhood: 'Roysambu',
    location_coordinates: { lat: -1.2185, lng: 36.8872, x: 52, y: 52 },
    photos: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Token Power Meter', 'Water Tank Storage', 'Perimeter Wall', 'Near Public Transport (Matatu)'],
    owner_id: 'landlord-mwangi',
    owner_name: 'Peter Mwangi (Landlord)',
    owner_phone: '+254 711 999 888',
    is_verified_listing: false,

    // Listing without tour to test comparison and filters
    tour_url: null,
    tour_provider: 'viewora',
    tour_verified: false,
    tour_added_at: null,
    tour_poster_url: null,
  },
  {
    id: 'listing-msa-01',
    title: 'Coastal 3-Bedroom Villa with Ocean Breeze',
    title_sw: 'Nyumba ya Kifahari ya Vyumba 3 yenye Upepo wa Bahari',
    description: 'Serene coastal paradise in Nyali, Mombasa. 5 minutes walk to Nyali Beach. Private garden, servant quarters, swimming pool access, and fresh sea breezes.',
    description_sw: 'Paradiso tulivu ya pwani Nyali, Mombasa. Dakika 5 kutembea hadi ufukwe wa Nyali. Bustani binafsi na bwawa la kuogelea.',
    rent_ksh: 75000,
    deposit_ksh: 75000,
    bedrooms: 3,
    bathrooms: 3,
    property_type: 'Villa',
    city: 'Mombasa',
    neighborhood: 'Nyali',
    location_coordinates: { lat: -4.0326, lng: 39.7042, x: 70, y: 82 },
    photos: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Swimming Pool', 'Private Garden', 'Air Conditioning', 'Perimeter Electric Fence', 'DSQ', 'Fresh Water'],
    owner_id: 'landlord-omar',
    owner_name: 'Sheikh Omar Al-Hassan',
    owner_phone: '+254 720 333 444',
    is_verified_listing: true,
    featured: true,

    // Viewora Tour link
    tour_url: 'https://app.viewora.software/tours/nyali-coastal-villa',
    tour_provider: 'viewora',
    tour_verified: true,
    tour_added_at: '2026-10-20T11:00:00Z',
    tour_poster_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'listing-ksm-01',
    title: 'Lakeside 2-Bedroom Apartment with Sunset Views',
    title_sw: 'Ghorofa ya Vyumba 2 Kando ya Ziwa Victoria',
    description: 'Prestigious Milimani, Kisumu residence overlooking Lake Victoria. Quiet, secure compound with mature trees, ample children play area and round-the-clock patrol.',
    description_sw: 'Makazi ya kifahari Milimani, Kisumu yanayoangalia Ziwa Victoria. Eneo tulivu lenye miti na ulinzi saa 24.',
    rent_ksh: 32000,
    deposit_ksh: 32000,
    bedrooms: 2,
    bathrooms: 1,
    property_type: 'Apartment',
    city: 'Kisumu',
    neighborhood: 'Milimani',
    location_coordinates: { lat: -0.1022, lng: 34.7617, x: 25, y: 52 },
    photos: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Lake View Balcony', 'Solar Lighting', 'Borehole Water', 'Children Play Area', 'Ample Parking'],
    owner_id: 'agent-odhiambo',
    owner_name: 'Jared Odhiambo (Prime Agents)',
    owner_phone: '+254 712 555 666',
    is_verified_listing: true,

    // Viewora Tour link
    tour_url: 'https://app.viewora.software/tours/milimani-lake-view-kisumu',
    tour_provider: 'viewora',
    tour_verified: true,
    tour_added_at: '2026-10-22T08:15:00Z',
    tour_poster_url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'listing-nbo-04',
    title: 'Executive 3-Bedroom Townhouse in Lavington',
    title_sw: 'Townhouse ya Kifahari ya Vyumba 3 Lavington',
    description: 'Spacious family townhouse in gated community. Modern fitted kitchen, mature private lawn, solar water, and 2 designated carports.',
    description_sw: 'Nyumba kubwa ya familia kwenye eneo lenye lango lililolindwa. Jiko la kisasa, nyasi ya kijani, na maegesho ya magari 2.',
    rent_ksh: 85000,
    deposit_ksh: 85000,
    bedrooms: 3,
    bathrooms: 3,
    property_type: 'Townhouse',
    city: 'Nairobi',
    neighborhood: 'Lavington',
    location_coordinates: { lat: -1.2800, lng: 36.7700, x: 45, y: 55 },
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Private Garden', 'Electric Fencing', 'Solar Water Heating', 'DSQ', 'Gated Community'],
    owner_id: 'landlord-kimani',
    owner_name: 'David Kimani (Landlord)',
    owner_phone: '+254 722 100 200',
    is_verified_listing: true,

    // Listing without tour
    tour_url: null,
    tour_provider: 'viewora',
    tour_verified: false,
    tour_added_at: null,
    tour_poster_url: null,
  }
];

export const INITIAL_REFERRALS: CaptureReferral[] = [
  {
    id: 'ref-01',
    listing_id: 'listing-nbo-04',
    listing_title: 'Executive 3-Bedroom Townhouse in Lavington',
    owner_id: 'landlord-kimani',
    area: 'Nairobi - Lavington',
    property_type: 'Townhouse',
    preferred_date: '2026-10-30',
    notes: 'Shooting 3 bedrooms, private lawn, and modern kitchen.',
    status: 'booked',
    created_at: '2026-10-24T10:00:00Z',
  },
  {
    id: 'ref-02',
    listing_id: 'listing-nbo-03',
    listing_title: 'Affordable Cozy Bedsitter near TRM',
    owner_id: 'landlord-mwangi',
    area: 'Nairobi - Roysambu',
    property_type: 'Bedsitter',
    preferred_date: '2026-11-02',
    notes: 'Compact bedsitter shooting.',
    status: 'clicked',
    created_at: '2026-10-25T14:20:00Z',
  }
];

export const DEFAULT_PARTNER_SETTINGS: PartnerSettings = {
  id: 'default',
  partner_discount_enabled: true,
  partner_discount_code: 'NYUMBAGO20',
  partner_discount_percentage: 15,
  partner_branding_enabled: false, // Default OFF until Viewora approves in writing
  viewora_api_enabled: false,       // Default OFF for Phase 3 API mock
  payments_enabled: false,          // Default OFF until M-Pesa provider setup
  updated_at: '2026-10-27T00:00:00Z',
};
