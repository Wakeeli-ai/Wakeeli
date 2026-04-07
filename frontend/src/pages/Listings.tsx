import { useState, useEffect, useMemo, useRef } from 'react';
import { createListing, deleteListing, getListings, updateListing } from '../api';
import {
  Building2, Bed, Bath, Maximize, X, MapPin, Search, Loader2,
  LayoutGrid, List, ChevronLeft, ChevronRight, SlidersHorizontal,
  Upload, Plus, Flame, Mic, ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from '../utils/toast';

// Types

type Listing = {
  id: string;
  title: string;
  listing_type: 'buy' | 'rent';
  property_type: string;
  city: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  built_up_area: number;
  sale_price: number | null;
  rent_price: number | null;
  furnishing: string;
  description: string;
  view: string;
  image_url: string;
  status: string;
  parking: number | null;
  elevator: boolean;
  generator: boolean;
  terrace_area: number | null;
  maids_room: boolean;
  balconies: number | null;
  electricity_24_7: boolean;
  notes: string;
};

type ListingStatus = 'available' | 'hot_listing' | 'under_offer' | 'sold';

// Helpers

const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  hot_listing: 'Hot Listing',
  under_offer: 'Under Offer',
  sold: 'Sold',
};

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-emerald-500 text-white',
  hot_listing: 'bg-red-500 text-white',
  under_offer: 'bg-amber-500 text-white',
  sold: 'bg-slate-400 text-white',
};

const AI_RULES = [
  'Matches buyers looking for family homes in coastal areas',
  'Suitable for investors seeking rental yield above 5%',
  'Fits profiles requiring 3+ bedrooms with parking',
];

const TOUR_SLOTS = [
  'Mon Apr 7 at 10:00 AM',
  'Wed Apr 9 at 2:00 PM',
  'Sat Apr 12 at 11:00 AM',
];

const MOCK_LISTINGS: Listing[] = [
  {
    id: '770487',
    title: 'Luxury 4BR Apartment - Achrafieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Achrafieh',
    area: 'Achrafieh',
    bedrooms: 4,
    bathrooms: 5,
    built_up_area: 285,
    sale_price: 800000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '285 sqm modern apartment with proper finishing, sunny clean space and ready to move in. Open kitchen, built-in wardrobes and two generous balconies.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'sold',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'One of the best-connected neighborhoods in Beirut. Walk to restaurants, cafes, galleries and public transport.',
  },
  {
    id: '216739',
    title: 'Spacious 3BR Bright Apartment - Achrafieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Achrafieh',
    area: 'Achrafieh',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 180,
    sale_price: 500000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '180 sqm with large window fronts, elegant laminated floors and high-end finishing. Modern-equipped kitchen and built-in wardrobes throughout.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Premium Achrafieh address with vibrant street life. Everything within walking distance.',
  },
  {
    id: '126225',
    title: 'Premium Penthouse - Achrafieh',
    listing_type: 'buy',
    property_type: 'Penthouse',
    city: 'Achrafieh',
    area: 'Achrafieh',
    bedrooms: 4,
    bathrooms: 5,
    built_up_area: 320,
    sale_price: 950000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '320 sqm penthouse with an 80 sqm private terrace offering sweeping city and partial sea views. High ceilings, premium marble floors and custom cabinetry.',
    view: 'City & Sea View',
    image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: 80.0,
    maids_room: true,
    balconies: 3,
    electricity_24_7: true,
    notes: 'Top floor unit in a prestigious Achrafieh building. Rarely available at this size.',
  },
  {
    id: '877572',
    title: 'Elegant 3BR Family Home - Achrafieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Achrafieh',
    area: 'Achrafieh',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 240,
    sale_price: 620000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '240 sqm with premium stone floors, gypsum ceilings and deco lighting. Spacious salon, formal dining room and modern open kitchen.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Prestigious building on a quiet residential street, steps from Mar Mikhael and Gemmayzeh.',
  },
  {
    id: '388389',
    title: 'Mountain View 3BR - Kornet Chehwan',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Kornet Chehwan',
    area: 'Kornet Chehwan',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 230,
    sale_price: 365000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: 'Serene prestigious street. Premium specification, marble floors, gypsum ceiling, electric roller shutters and double-glazed windows. Open mountain and sea views.',
    view: 'Mountain & Sea View',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Perfect family layout with master suite, dressing room and spacious living areas. Visitor parking available.',
  },
  {
    id: '356787',
    title: 'Charming 3BR with Terrace - Kornet Chehwan',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Kornet Chehwan',
    area: 'Kornet Chehwan',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 250,
    sale_price: 420000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '250 sqm well-appointed apartment with 30 sqm private balcony terrace. Stone cladding facade, premium finishes and video phone entry system.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 30.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Quiet calm street in one of Metn\'s most desirable residential areas.',
  },
  {
    id: '334053',
    title: 'Contemporary 3BR - Kornet Chehwan',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Kornet Chehwan',
    area: 'Kornet Chehwan',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 195,
    sale_price: 295000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '195 sqm modern apartment with wooden cabinets, tiled floors and well-proportioned rooms. Includes entry hall, living room, dining area and eat-in kitchen.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Walking distance to schools, supermarkets and main roads.',
  },
  {
    id: '246316',
    title: 'Furnished 2BR Terrace Apartment - Mtayleb',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Mtayleb',
    area: 'Mtayleb',
    bedrooms: 2,
    bathrooms: 4,
    built_up_area: 220,
    sale_price: 260000.0,
    rent_price: null,
    furnishing: 'Fully Furnished',
    description: '220 sqm fully furnished apartment with a massive 110 sqm terrace. TV room, living room, fully fitted kitchen. Elegant and well-maintained throughout.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 110.0,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Calm and secluded Mtayleb residential area. Ideal for families seeking outdoor space.',
  },
  {
    id: '872246',
    title: 'Spacious 3BR Family Apartment - Mtayleb',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Mtayleb',
    area: 'Mtayleb',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 240,
    sale_price: 310000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '240 sqm with generous salon, dining room and modern kitchen. Built-in wardrobes, tiled floors and large balcony with mountain views.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Prime Mtayleb location with easy access to Beirut and North Metn.',
  },
  {
    id: '207473',
    title: 'Panoramic 4BR Luxury - Mtayleb',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Mtayleb',
    area: 'Mtayleb',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 290,
    sale_price: 510000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '290 sqm high-spec apartment with 50 sqm wraparound terrace. Master suite with dressing room, premium marble floors and gypsum ceilings.',
    view: 'Panoramic Mountain & Sea',
    image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: 50.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'One of Mtayleb\'s finest residential buildings. Security 24/7 and beautifully landscaped entrance.',
  },
  {
    id: '809570',
    title: 'Luxury 3BR with Garden - Bsalim',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Bsalim',
    area: 'Bsalim',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 210,
    sale_price: 380000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '210 sqm elegant apartment with a 280 sqm private garden and terrace. Chimney, solar panels (16 panels), stone and wood décor, ceramic floors.',
    view: 'Garden View',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'hot_listing',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 280.0,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Grand and elegant building on a peaceful site. Perfect for outdoor entertaining and family living.',
  },
  {
    id: '876646',
    title: 'Modern 3BR Apartment - Bsalim',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Bsalim',
    area: 'Bsalim',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 200,
    sale_price: 355000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '200 sqm with quality finishes, gypsum ceilings and deco lighting. Spacious salon, modern kitchen and ample storage.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Well-located in Bsalim with quick access to Nahr el Kalb highway.',
  },
  {
    id: '671858',
    title: 'Spacious 4BR Mountain Retreat - Bsalim',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Bsalim',
    area: 'Bsalim',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 260,
    sale_price: 490000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '260 sqm with 40 sqm terrace and panoramic mountain views. High-end finishes, built-in wardrobes and designer kitchen.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: 40.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Calm residential street, ideal for families. Near international schools and shopping centers.',
  },
  {
    id: '191161',
    title: 'Partial Sea View 3BR - Dbayeh Waterfront',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Dbayeh Waterfront',
    area: 'Dbayeh Waterfront',
    bedrooms: 3,
    bathrooms: 5,
    built_up_area: 350,
    sale_price: 1300000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '350 sqm prime waterfront apartment with 3 master bedrooms, 5 bathrooms, 2 living rooms and dining area. 3 balconies with sea views.',
    view: 'Partial Sea View',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    status: 'available',
    parking: 3,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 3,
    electricity_24_7: true,
    notes: 'Easy access to Dbayeh highway and Waterfront promenade. Near restaurants and public transport.',
  },
  {
    id: '719176',
    title: 'Full Sea View Penthouse - Dbayeh Waterfront',
    listing_type: 'buy',
    property_type: 'Penthouse',
    city: 'Dbayeh Waterfront',
    area: 'Dbayeh Waterfront',
    bedrooms: 4,
    bathrooms: 5,
    built_up_area: 400,
    sale_price: 1500000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '400 sqm luxury penthouse with 100 sqm terrace. Breathtaking panoramic sea views, premium marble floors, custom kitchen and smart home system.',
    view: 'Full Sea View',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'available',
    parking: 3,
    elevator: true,
    generator: true,
    terrace_area: 100.0,
    maids_room: true,
    balconies: 3,
    electricity_24_7: true,
    notes: 'Trophy property in Dbayeh Waterfront. Ultimate luxury coastal living near Beirut.',
  },
  {
    id: '542417',
    title: 'Contemporary 3BR Sea View - Dbayeh Waterfront',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Dbayeh Waterfront',
    area: 'Dbayeh Waterfront',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 310,
    sale_price: 980000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '310 sqm elegant apartment with sea-facing balconies, high-end kitchen, marble floors and premium fixtures throughout.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    status: 'available',
    parking: 3,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Sought-after Waterfront development with 24/7 security and concierge.',
  },
  {
    id: '133326',
    title: 'Furnished Duplex with Terrace - Ghosta',
    listing_type: 'buy',
    property_type: 'Duplex',
    city: 'Ghosta',
    area: 'Ghosta',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 180,
    sale_price: 175000.0,
    rent_price: null,
    furnishing: 'Fully Furnished',
    description: '180 sqm modern duplex with full automation system, oak doors, chimney and luxury wood-steel staircase. Double glazing and complete waterproofing.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Private calm street in Ghosta. Convenient access to all main Keserwan roads.',
  },
  {
    id: '131244',
    title: 'Bright 3BR Apartment - Ghosta',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Ghosta',
    area: 'Ghosta',
    bedrooms: 3,
    bathrooms: 2,
    built_up_area: 190,
    sale_price: 200000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '190 sqm well-lit apartment with quality tiles, built-in wardrobes and spacious salon. Calm residential building with generator backup.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    status: 'under_offer',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Family-friendly neighborhood with schools and supermarkets nearby.',
  },
  {
    id: '198246',
    title: 'Charming 2BR Garden Apartment - Ghosta',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Ghosta',
    area: 'Ghosta',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 160,
    sale_price: 155000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '160 sqm apartment with a private 40 sqm garden. Tiled floors, sunny layout and well-proportioned bedrooms.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: 40.0,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Great value in Ghosta. Quiet street with easy access to Jounieh and Dbayeh.',
  },
  {
    id: '329258',
    title: 'Elegant 3BR - Broumana',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Broumana',
    area: 'Broumana',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 280,
    sale_price: 460000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '280 sqm spacious apartment with big salon, dining room, TV room, walk-in closet and chimney. Quality finishes and generous proportions.',
    view: 'City & Mountain View',
    image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Prime Broumana location. Near restaurants, shops and main promenade. Pets allowed.',
  },
  {
    id: '343962',
    title: 'Luxury 4BR Family Home - Broumana',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Broumana',
    area: 'Broumana',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 330,
    sale_price: 600000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '330 sqm premium apartment with high ceilings, marble floors, gypsum ceilings and a well-designed family layout. Chimney and high-end kitchen.',
    view: 'Mountain & Sea View',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'hot_listing',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'One of Broumana\'s most desirable addresses. Peaceful and surrounded by pine trees.',
  },
  {
    id: '629903',
    title: 'Cozy 3BR Mountain Apartment - Broumana',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Broumana',
    area: 'Broumana',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 220,
    sale_price: 310000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '220 sqm comfortable apartment with warm mountain character. Well-finished, functional layout with built-in wardrobes and bright bedrooms.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Ideal as a primary residence or summer retreat in Broumana.',
  },
  {
    id: '731262',
    title: '3BR Apartment with Garden - Zikrit',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Zikrit',
    area: 'Zikrit',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 175,
    sale_price: 215000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '175 sqm with 25 sqm private garden. 3 bedrooms, maid\'s room with bathroom, 4 bathrooms and 3 parking spaces. Bright and well-proportioned.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    status: 'available',
    parking: 3,
    elevator: true,
    generator: false,
    terrace_area: 25.0,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Prime Zikrit area. Calm and clean neighborhood with easy mountain access.',
  },
  {
    id: '127824',
    title: 'Spacious 3BR Panoramic View - Zikrit',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Zikrit',
    area: 'Zikrit',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 200,
    sale_price: 240000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '200 sqm apartment with stunning valley and mountain views. Stone floors, double-glazed windows and well-finished interior.',
    view: 'Mountain & Valley View',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Peaceful village-like setting in Zikrit. Close to nature trails and highways.',
  },
  {
    id: '688508',
    title: 'Sea View 3BR - Jounieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Jounieh',
    area: 'Jounieh',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 250,
    sale_price: 550000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '250 sqm modern apartment with panoramic sea views over Jounieh Bay. Premium finishes, open-plan living and sleek designer kitchen.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Central Jounieh location with easy cable car access and proximity to Casino du Liban and the Kaslik strip.',
  },
  {
    id: '308496',
    title: 'Modern 3BR Apartment - Jounieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Jounieh',
    area: 'Jounieh',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 195,
    sale_price: 380000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '195 sqm well-finished apartment in a prestigious Jounieh building. Open kitchen, built-in wardrobes and generous living areas.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    status: 'sold',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Centrally located near schools, restaurants and public transport.',
  },
  {
    id: '850800',
    title: 'Luxury Seafront 4BR - Jounieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Jounieh',
    area: 'Jounieh',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 300,
    sale_price: 780000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '300 sqm seafront apartment with 30 sqm balcony directly overlooking Jounieh Bay. Master suite with dressing room, premium marble and oak details.',
    view: 'Full Sea View',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: 30.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Rare direct seafront position in Jounieh. Trophy property.',
  },
  {
    id: '781453',
    title: 'Sea View Luxury 3BR - Kaslik',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Kaslik',
    area: 'Kaslik',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 290,
    sale_price: 720000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '290 sqm upscale apartment in the heart of Kaslik. High-end finishes, open sea views, designer kitchen and premium bathroom fittings.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Steps from Kaslik waterfront, restaurants and nightlife. Lebanon\'s most prestigious coastal address.',
  },
  {
    id: '835392',
    title: 'Bright 3BR Apartment - Kaslik',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Kaslik',
    area: 'Kaslik',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 220,
    sale_price: 490000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '220 sqm in a premium Kaslik building. Elegant finishes, built-in wardrobes, spacious salon and dining area.',
    view: 'Partial Sea View',
    image_url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Prime Kaslik location. Walking distance to shops, restaurants and the waterfront.',
  },
  {
    id: '671412',
    title: '3BR Apartment - Jal el Dib',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Jal el Dib',
    area: 'Jal el Dib',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 175,
    sale_price: 320000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '175 sqm modern apartment with quality finishes, open kitchen and generous bedrooms. Located in a well-managed building with concierge.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Excellent connectivity — minutes from Dbayeh highway, Metn and Beirut.',
  },
  {
    id: '539898',
    title: '2BR Value Apartment - Jal el Dib',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Jal el Dib',
    area: 'Jal el Dib',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 155,
    sale_price: 260000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '155 sqm practical and well-finished apartment. Bright living area, modern kitchen and comfortable bedrooms.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'hot_listing',
    parking: 1,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Ideal for young families or professionals. Great value in Jal el Dib.',
  },
  {
    id: '331148',
    title: 'Premium 3BR Apartment - Hazmieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Hazmieh',
    area: 'Hazmieh',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 210,
    sale_price: 410000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '210 sqm in a prestigious Hazmieh building. Marble floors, gypsum ceilings, electric shutters and high-spec kitchen.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Prime Hazmieh address, close to embassies, international schools and Beirut Souks.',
  },
  {
    id: '571029',
    title: 'Spacious 4BR - Hazmieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Hazmieh',
    area: 'Hazmieh',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 270,
    sale_price: 580000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '270 sqm luxury apartment with 4 bedrooms, walk-in closets, double salon and high-end kitchen. Premium stone and wood décor throughout.',
    view: 'City & Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Hazmieh\'s most coveted residential enclave near the southern entrance to Beirut.',
  },
  {
    id: '717889',
    title: '3BR Family Apartment - Baabda',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Baabda',
    area: 'Baabda',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 185,
    sale_price: 290000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '185 sqm well-designed family apartment with warm finishes, built-in wardrobes and comfortable proportions.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Quiet Baabda street. Close to Baabda Palace and the Sannine Highway.',
  },
  {
    id: '391704',
    title: 'Luxury 3BR with Terrace - Baabda',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Baabda',
    area: 'Baabda',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 220,
    sale_price: 370000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '220 sqm with a 25 sqm terrace and mountain views. High-quality finishes, central AC, gypsum ceilings and video phone entry.',
    view: 'Mountain & Valley View',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'under_offer',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 25.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Prestigious neighborhood in Baabda. Near schools and major highways.',
  },
  {
    id: '948749',
    title: 'Modern 3BR - Naccache',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Naccache',
    area: 'Naccache',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 235,
    sale_price: 440000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '235 sqm contemporary apartment with stone cladding building, open kitchen, deco lighting and built-in wardrobes. Clean, elegant design.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Naccache\'s prime residential corridor. Minutes from Beirut International Airport and Dbayeh highway.',
  },
  {
    id: '106814',
    title: '2BR Bright Apartment - Naccache',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Naccache',
    area: 'Naccache',
    bedrooms: 2,
    bathrooms: 3,
    built_up_area: 180,
    sale_price: 310000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '180 sqm in a well-maintained Naccache building. Functional layout, quality tiled floors and modern bathroom fittings.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Great location between Jal el Dib and Antelias. Easy access to Beirut.',
  },
  {
    id: '895667',
    title: '3BR Apartment - Antelias',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Antelias',
    area: 'Antelias',
    bedrooms: 3,
    bathrooms: 2,
    built_up_area: 170,
    sale_price: 285000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '170 sqm well-proportioned apartment in a solid Antelias building. Spacious salon, dining area and functional kitchen.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Central Antelias. Steps from the main highway, supermarkets and restaurants.',
  },
  {
    id: '944962',
    title: 'Spacious 3BR with Balcony - Antelias',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Antelias',
    area: 'Antelias',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 215,
    sale_price: 395000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '215 sqm elegant apartment with 2 balconies, built-in wardrobes and a modern equipped kitchen. Gypsum ceilings and deco lighting throughout.',
    view: 'City & Partial Sea View',
    image_url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Prime Antelias address near Demco Tower and the waterfront promenade.',
  },
  {
    id: '267414',
    title: 'Mountain View 4BR - Rabieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Rabieh',
    area: 'Rabieh',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 280,
    sale_price: 650000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '280 sqm luxury apartment with mountain views, master suite with walk-in closet, elegant marble floors and custom cabinetry.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'One of Metn\'s premium addresses. Green and peaceful setting.',
  },
  {
    id: '832052',
    title: 'Grand 4BR with Terrace - Rabieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Rabieh',
    area: 'Rabieh',
    bedrooms: 4,
    bathrooms: 5,
    built_up_area: 350,
    sale_price: 850000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '350 sqm grand family apartment with a 50 sqm terrace, 4 bedrooms each with en-suite, formal reception and private driveway.',
    view: 'Panoramic Mountain & Sea',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'hot_listing',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: 50.0,
    maids_room: true,
    balconies: 3,
    electricity_24_7: true,
    notes: 'Rabieh\'s finest residential building. Discreet security and beautifully landscaped grounds.',
  },
  {
    id: '543143',
    title: 'Mountain Retreat 3BR - Beit Meri',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Beit Meri',
    area: 'Beit Meri',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 260,
    sale_price: 480000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '260 sqm spacious apartment in the serene hills of Beit Meri. Large balconies with stunning mountain vistas, chimney and premium finishes.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Steps from Beit Meri\'s charming restaurants and summer resorts. Easy access to Dbayeh and Beirut.',
  },
  {
    id: '456778',
    title: '3BR Elegant Apartment - Beit Meri',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Beit Meri',
    area: 'Beit Meri',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 210,
    sale_price: 370000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '210 sqm with a 20 sqm private terrace. Stone décor, wooden cabinets and double-glazed windows. Warm mountain home feel.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 20.0,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Peaceful residential area in the Metn heights.',
  },
  {
    id: '391369',
    title: '3BR Family Apartment - Mansourieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Mansourieh',
    area: 'Mansourieh',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 200,
    sale_price: 340000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '200 sqm well-finished apartment with tiled floors, built-in wardrobes and spacious salon. Calm residential building with 24/7 concierge.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Central Mansourieh, close to Beirut. Easy highway access.',
  },
  {
    id: '263032',
    title: '2BR Modern Apartment - Mansourieh',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Mansourieh',
    area: 'Mansourieh',
    bedrooms: 2,
    bathrooms: 3,
    built_up_area: 165,
    sale_price: 270000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '165 sqm functional and modern apartment with quality finishes. Bright salon, fitted kitchen and comfortable bedrooms.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Good value in a well-established Mansourieh neighborhood.',
  },
  {
    id: '325772',
    title: 'Sea View 3BR - Batroun',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Batroun',
    area: 'Batroun',
    bedrooms: 3,
    bathrooms: 2,
    built_up_area: 185,
    sale_price: 330000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '185 sqm apartment with partial sea views over the Mediterranean. Light-filled rooms, stone accents and quality ceramic floors.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Walking distance to Batroun Old Souk, beaches and Phoenician Wall. Vibrant community with growing expat scene.',
  },
  {
    id: '900581',
    title: '2BR Coastal Apartment - Batroun',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Batroun',
    area: 'Batroun',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 150,
    sale_price: 220000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '150 sqm charming apartment with Mediterranean character. Balcony facing the sea, ceramic floors and bright well-proportioned rooms.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Great lifestyle property in one of Lebanon\'s most loved coastal towns.',
  },
  {
    id: '452944',
    title: 'Historic Town 3BR - Byblos',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Byblos (Jbeil)',
    area: 'Byblos (Jbeil)',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 220,
    sale_price: 410000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '220 sqm premium apartment with sea views in one of the world\'s oldest cities. High-end finishes, modern kitchen and spacious salon.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Steps from Byblos Port, Souk el Akel and the famous Crusader Castle.',
  },
  {
    id: '207175',
    title: '2BR Apartment - Byblos',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Byblos (Jbeil)',
    area: 'Byblos (Jbeil)',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 175,
    sale_price: 290000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '175 sqm well-proportioned apartment with character. Stone building, high ceilings and bright rooms with coastal breeze.',
    view: 'Partial Sea View',
    image_url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Excellent rental yield potential due to strong Byblos tourism market.',
  },
  {
    id: '197251',
    title: 'Sea View Luxury 4BR - Adma',
    listing_type: 'buy',
    property_type: 'Apartment',
    city: 'Adma',
    area: 'Adma',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 310,
    sale_price: 680000.0,
    rent_price: null,
    furnishing: 'Unfurnished',
    description: '310 sqm trophy apartment in prestigious Adma with 40 sqm terrace and full sea views. Master suite with dressing room, premium marble and custom joinery.',
    view: 'Full Sea View',
    image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: true,
    terrace_area: 40.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Adma is Lebanon\'s ultra-premium residential enclave. Gated community feel, total privacy and sea access.',
  },
  {
    id: '498382',
    title: 'Furnished 3BR Terrace - Antelias',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Antelias',
    area: 'Antelias',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 240,
    sale_price: null,
    rent_price: 3500.0,
    furnishing: 'Fully Furnished',
    description: 'Fully furnished apartment in Demco Tower with a 60 sqm terrace. 2 master bedrooms, fully equipped kitchen, big living room and maid\'s room.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'sold',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 60.0,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: '24/7 security and electricity. Near public transport and restaurants.',
  },
  {
    id: '201414',
    title: 'Spacious 3BR - Antelias',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Antelias',
    area: 'Antelias',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 175,
    sale_price: null,
    rent_price: 1800.0,
    furnishing: 'Furnished',
    description: 'Spacious furnished apartment in a well-managed Antelias building. 3 bedrooms, 3 bathrooms, modern kitchen and bright living area.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'under_offer',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Calm residential street. Easy access to Dbayeh and Jal el Dib.',
  },
  {
    id: '476417',
    title: '2BR Apartment - Antelias',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Antelias',
    area: 'Antelias',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 145,
    sale_price: null,
    rent_price: 1200.0,
    furnishing: 'Partly Furnished',
    description: '145 sqm partly furnished apartment. 2 bedrooms, 2 bathrooms, fitted kitchen and comfortable salon.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Centrally located in Antelias. Good value monthly rental.',
  },
  {
    id: '988662',
    title: 'Mountain View 2BR - Zekrit',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Zekrit',
    area: 'Zekrit',
    bedrooms: 2,
    bathrooms: 1,
    built_up_area: 110,
    sale_price: null,
    rent_price: 600.0,
    furnishing: 'Furnished',
    description: 'Furnished apartment with panoramic mountain views. Salon, dining area, 1 master bedroom, 1 bedroom and balcony. 9-year-old building.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Calm area in Zekrit. Pets not allowed. 2nd year $650/month, 3rd year $700/month.',
  },
  {
    id: '460663',
    title: 'Cozy Furnished 3BR - Zekrit',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Zekrit',
    area: 'Zekrit',
    bedrooms: 3,
    bathrooms: 2,
    built_up_area: 150,
    sale_price: null,
    rent_price: 950.0,
    furnishing: 'Furnished',
    description: '150 sqm furnished apartment with mountain views, 3 bedrooms, 2 bathrooms and bright living area. Well-maintained building.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Quiet residential Zekrit street. Great for families looking for affordable mountain living.',
  },
  {
    id: '733052',
    title: 'Furnished 3BR - Aaoukar',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Aaoukar',
    area: 'Aaoukar',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 140,
    sale_price: null,
    rent_price: 800.0,
    furnishing: 'Furnished',
    description: 'Furnished first-floor apartment in Aaoukar. 3 bedrooms including 1 master, 3 bathrooms, family room, dining room, fitted kitchen and wide balcony.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Good location, calm area, fully decorated. Sunny, healthy house. Barbecue area available.',
  },
  {
    id: '377370',
    title: 'Spacious 3BR - Aaoukar',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Aaoukar',
    area: 'Aaoukar',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 180,
    sale_price: null,
    rent_price: 1100.0,
    furnishing: 'Furnished',
    description: '180 sqm furnished apartment with 20 sqm balcony. 3 bedrooms, maid\'s room, fitted kitchen and generous salon. Well-presented throughout.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 20.0,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Aaoukar\'s calm residential core. Near international schools and main roads.',
  },
  {
    id: '946335',
    title: 'Luxury 2BR Terrace - Rabieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Rabieh',
    area: 'Rabieh',
    bedrooms: 2,
    bathrooms: 4,
    built_up_area: 220,
    sale_price: null,
    rent_price: 2500.0,
    furnishing: 'Fully Furnished',
    description: '220 sqm fully furnished apartment with a massive 110 sqm terrace. 2 master bedrooms, 4 bathrooms, TV room, living room and maid\'s room.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 110.0,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Prestigious Rabieh address with 24/7 electricity and concierge. Ideal for executives and families.',
  },
  {
    id: '145561',
    title: 'Premium 4BR - Rabieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Rabieh',
    area: 'Rabieh',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 300,
    sale_price: null,
    rent_price: 3500.0,
    furnishing: 'Fully Furnished',
    description: '300 sqm grand fully furnished apartment in the heart of Rabieh. 4 master bedrooms, spacious living areas and high-end kitchen.',
    view: 'Panoramic Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'One of Metn\'s most prestigious addresses. Security and concierge 24/7.',
  },
  {
    id: '865179',
    title: '3BR Mountain Apartment - Rabieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Rabieh',
    area: 'Rabieh',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 210,
    sale_price: null,
    rent_price: 1900.0,
    furnishing: 'Partly Furnished',
    description: '210 sqm partly furnished apartment with mountain views. 3 bedrooms, 3 bathrooms, modern kitchen and large salon.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Calm and green Rabieh neighborhood. Near Metn restaurants and highway.',
  },
  {
    id: '581741',
    title: 'Panoramic 3BR - Mtayleb',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Mtayleb',
    area: 'Mtayleb',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 300,
    sale_price: null,
    rent_price: 2390.0,
    furnishing: 'Unfurnished',
    description: '300 sqm luxury unfurnished apartment with panoramic sea and mountain views. 3 bedrooms including 1 master, 4 bathrooms and a fully equipped kitchen.',
    view: 'Panoramic Mountain & Sea',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'hot_listing',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Calm Mtayleb area with 24/7 electricity and concierge. Near restaurants and main highways.',
  },
  {
    id: '662275',
    title: 'Luxury 4BR Sea View - Mtayleb',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Mtayleb',
    area: 'Mtayleb',
    bedrooms: 4,
    bathrooms: 5,
    built_up_area: 400,
    sale_price: null,
    rent_price: 2300.0,
    furnishing: 'Fully Furnished',
    description: '400 sqm fully furnished apartment with panoramic sea views. 4 master bedrooms each with en-suite, spacious living areas and high-end kitchen.',
    view: 'Panoramic Sea View',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Premium Mtayleb building with concierge and 24/7 security. Ideal for large families.',
  },
  {
    id: '230889',
    title: 'Furnished 2BR Terrace - Mtayleb',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Mtayleb',
    area: 'Mtayleb',
    bedrooms: 2,
    bathrooms: 4,
    built_up_area: 220,
    sale_price: null,
    rent_price: 1800.0,
    furnishing: 'Fully Furnished',
    description: '220 sqm fully furnished with a 110 sqm terrace and mountain views. 2 master bedrooms, TV room, living room and maid\'s room.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 110.0,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Calm, secluded Mtayleb street. Perfect for families who love outdoor living.',
  },
  {
    id: '496922',
    title: 'Mountain View 3BR - Beit Meri',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Beit Meri',
    area: 'Beit Meri',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 300,
    sale_price: null,
    rent_price: 1250.0,
    furnishing: 'Furnished',
    description: '300 sqm furnished apartment in the serene hills of Beit Meri. 3 bedrooms including master with walk-in closet, 3 bathrooms, 2 living rooms, private garden and terrace.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 3,
    electricity_24_7: false,
    notes: 'Stunning mountain views and peaceful setting. Near restaurants and summer resorts.',
  },
  {
    id: '182627',
    title: 'Luxury 3BR with Terrace - Beit Meri',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Beit Meri',
    area: 'Beit Meri',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 260,
    sale_price: null,
    rent_price: 1700.0,
    furnishing: 'Furnished',
    description: '260 sqm elegantly furnished apartment with 40 sqm terrace and mountain views. Master suite, built-in wardrobes and high-end kitchen appliances.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 40.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Premium Beit Meri location. Easy access to Dbayeh and Metn highway.',
  },
  {
    id: '678856',
    title: '3BR Terrace Apartment - Biyada',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Biyada',
    area: 'Biyada',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 280,
    sale_price: null,
    rent_price: 2000.0,
    furnishing: 'Partly Furnished',
    description: '280 sqm semi-furnished apartment with a 150 sqm terrace with views. 3 master bedrooms, 4 bathrooms, TV room and fitted kitchen with appliances.',
    view: 'Mountain & City View',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 150.0,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Calm and peaceful Biyada neighborhood. Ideal for families who love outdoor space.',
  },
  {
    id: '407419',
    title: 'Spacious 4BR - Biyada',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Biyada',
    area: 'Biyada',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 300,
    sale_price: null,
    rent_price: 2400.0,
    furnishing: 'Partly Furnished',
    description: '300 sqm well-maintained apartment with 4 bedrooms, 4 bathrooms and generous living areas. Storage room and 2 covered parking.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Quiet residential Biyada area. Minutes from Jal el Dib and main highways.',
  },
  {
    id: '969693',
    title: 'Furnished Full-Floor 3BR - Sin el Fil',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Sin el Fil',
    area: 'Sin el Fil',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 175,
    sale_price: null,
    rent_price: 1200.0,
    furnishing: 'Fully Furnished',
    description: '175 sqm fully decorated apartment occupying the entire floor. 3 bedrooms including 1 master, 3 bathrooms, fully equipped kitchen and bright salon.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Calm residential area with concierge. Pets allowed. Near restaurants and public transport.',
  },
  {
    id: '759176',
    title: '3BR Apartment - Sin el Fil',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Sin el Fil',
    area: 'Sin el Fil',
    bedrooms: 3,
    bathrooms: 2,
    built_up_area: 130,
    sale_price: null,
    rent_price: 900.0,
    furnishing: 'Furnished',
    description: '130 sqm furnished apartment. 3 bedrooms, 2 bathrooms, fitted kitchen and comfortable living area.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
    status: 'under_offer',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Good monthly rental value in Sin el Fil. Easy access to Dora and Beirut.',
  },
  {
    id: '748564',
    title: 'Elegant 3BR Decorated - Sin el Fil',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Sin el Fil',
    area: 'Sin el Fil',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 195,
    sale_price: null,
    rent_price: 1400.0,
    furnishing: 'Fully Furnished',
    description: '195 sqm beautifully decorated apartment with 3 bedrooms, maid\'s room, modern kitchen and spacious salon. Fully furnished with premium fittings.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Near major Sin el Fil landmarks and shopping centers.',
  },
  {
    id: '479201',
    title: 'Furnished Sea View 3BR - Jounieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Jounieh',
    area: 'Jounieh',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 210,
    sale_price: null,
    rent_price: 2500.0,
    furnishing: 'Fully Furnished',
    description: '210 sqm fully furnished apartment with panoramic sea views over Jounieh Bay. 3 bedrooms, 3 bathrooms and elegant living areas.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'hot_listing',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Central Jounieh location. Near cable car, Casino du Liban and the waterfront.',
  },
  {
    id: '705397',
    title: '3BR Apartment - Jounieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Jounieh',
    area: 'Jounieh',
    bedrooms: 3,
    bathrooms: 2,
    built_up_area: 170,
    sale_price: null,
    rent_price: 1600.0,
    furnishing: 'Furnished',
    description: '170 sqm furnished apartment in a well-managed Jounieh building. 3 bedrooms, modern kitchen and bright living area.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Good Jounieh location near restaurants, schools and main roads.',
  },
  {
    id: '301629',
    title: 'Luxury Seafront 4BR - Jounieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Jounieh',
    area: 'Jounieh',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 300,
    sale_price: null,
    rent_price: 3800.0,
    furnishing: 'Fully Furnished',
    description: '300 sqm fully furnished seafront apartment with 30 sqm balcony. 4 bedrooms, master suite with dressing room, premium kitchen appliances and luxury fittings.',
    view: 'Full Sea View',
    image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 30.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'One of Jounieh\'s most sought-after seafront buildings.',
  },
  {
    id: '838797',
    title: 'Sea View Luxury 3BR - Kaslik',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Kaslik',
    area: 'Kaslik',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 250,
    sale_price: null,
    rent_price: 3000.0,
    furnishing: 'Fully Furnished',
    description: '250 sqm fully furnished premium apartment in the heart of Kaslik. 3 bedrooms, 3 bathrooms, designer kitchen and open sea views.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Steps from Kaslik waterfront, restaurants and nightlife. Lebanon\'s most vibrant coastal address.',
  },
  {
    id: '172933',
    title: '3BR Modern Apartment - Kaslik',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Kaslik',
    area: 'Kaslik',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 200,
    sale_price: null,
    rent_price: 2000.0,
    furnishing: 'Furnished',
    description: '200 sqm furnished apartment with partial sea views. 3 bedrooms, 3 bathrooms, modern fitted kitchen and spacious living area.',
    view: 'Partial Sea View',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Prime Kaslik address near the waterfront promenade.',
  },
  {
    id: '148050',
    title: 'Furnished 3BR - Jal el Dib',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Jal el Dib',
    area: 'Jal el Dib',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 165,
    sale_price: null,
    rent_price: 1400.0,
    furnishing: 'Furnished',
    description: '165 sqm furnished apartment. 3 bedrooms including 1 master, 3 bathrooms, modern kitchen and well-lit salon.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    status: 'sold',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Well-connected Jal el Dib location. Near highways, supermarkets and restaurants.',
  },
  {
    id: '793384',
    title: '2BR Comfortable Apartment - Jal el Dib',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Jal el Dib',
    area: 'Jal el Dib',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 140,
    sale_price: null,
    rent_price: 1000.0,
    furnishing: 'Furnished',
    description: '140 sqm furnished apartment. 2 bedrooms, 2 bathrooms, equipped kitchen and cozy living area.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Good monthly rental value in central Jal el Dib.',
  },
  {
    id: '338968',
    title: 'Luxury 3BR - Hazmieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Hazmieh',
    area: 'Hazmieh',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 200,
    sale_price: null,
    rent_price: 2000.0,
    furnishing: 'Partly Furnished',
    description: '200 sqm semi-furnished apartment in a prestigious Hazmieh building. 3 bedrooms, 3 bathrooms, marble floors and premium kitchen.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Near embassies, international schools and the southern Beirut entrance.',
  },
  {
    id: '910620',
    title: 'Elegant 3BR - Hazmieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Hazmieh',
    area: 'Hazmieh',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 175,
    sale_price: null,
    rent_price: 1600.0,
    furnishing: 'Furnished',
    description: '175 sqm furnished apartment with quality finishes. 3 bedrooms, marble floors, gypsum ceilings and modern kitchen.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Quiet Hazmieh street. Walking distance to major amenities.',
  },
  {
    id: '403445',
    title: '3BR Apartment - Baabda',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Baabda',
    area: 'Baabda',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 180,
    sale_price: null,
    rent_price: 1200.0,
    furnishing: 'Furnished',
    description: '180 sqm furnished family apartment. 3 bedrooms including 1 master, 3 bathrooms, dining room and fitted kitchen.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Calm Baabda neighborhood near main highway and schools.',
  },
  {
    id: '183667',
    title: '2BR Mountain Apartment - Baabda',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Baabda',
    area: 'Baabda',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 150,
    sale_price: null,
    rent_price: 900.0,
    furnishing: 'Furnished',
    description: '150 sqm furnished apartment with mountain views. 2 bedrooms, 2 bathrooms, fitted kitchen and bright salon.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'hot_listing',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Good monthly rental value in Baabda. Near major roads.',
  },
  {
    id: '996865',
    title: 'Luxury Furnished 3BR - Achrafieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Achrafieh',
    area: 'Achrafieh',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 200,
    sale_price: null,
    rent_price: 2800.0,
    furnishing: 'Fully Furnished',
    description: '200 sqm fully furnished premium apartment in the heart of Achrafieh. 3 bedrooms, 3 bathrooms, designer kitchen and elegant finishes.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Walking distance to the best restaurants, galleries and nightlife in Beirut.',
  },
  {
    id: '344098',
    title: 'Grand 4BR Penthouse - Achrafieh',
    listing_type: 'rent',
    property_type: 'Penthouse',
    city: 'Achrafieh',
    area: 'Achrafieh',
    bedrooms: 4,
    bathrooms: 5,
    built_up_area: 280,
    sale_price: null,
    rent_price: 4000.0,
    furnishing: 'Fully Furnished',
    description: '280 sqm fully furnished penthouse with a 70 sqm private terrace and city/sea views. 4 bedrooms, 5 bathrooms, premium kitchen and luxury fittings.',
    view: 'City & Sea View',
    image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 70.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Achrafieh\'s finest rental offering. Rarely available at this spec.',
  },
  {
    id: '205907',
    title: 'Modern 2BR - Achrafieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Achrafieh',
    area: 'Achrafieh',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 140,
    sale_price: null,
    rent_price: 1800.0,
    furnishing: 'Fully Furnished',
    description: '140 sqm stylishly furnished apartment in a premium Achrafieh building. 2 bedrooms, 2 bathrooms, modern kitchen and bright living area.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Central Achrafieh, walking distance to everything.',
  },
  {
    id: '498591',
    title: 'Furnished 3BR - Naccache',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Naccache',
    area: 'Naccache',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 200,
    sale_price: null,
    rent_price: 1800.0,
    furnishing: 'Furnished',
    description: '200 sqm furnished apartment in Naccache. 3 bedrooms, 3 bathrooms, modern kitchen and spacious salon.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Well-located between Jal el Dib and Antelias. Easy airport access.',
  },
  {
    id: '391476',
    title: '2BR Apartment - Naccache',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Naccache',
    area: 'Naccache',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 170,
    sale_price: null,
    rent_price: 1300.0,
    furnishing: 'Furnished',
    description: '170 sqm furnished apartment. 2 bedrooms, 2 bathrooms, fitted kitchen and well-lit living area.',
    view: 'City View',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    status: 'under_offer',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Good value in a well-managed Naccache building.',
  },
  {
    id: '575435',
    title: 'Mountain View 3BR - Broumana',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Broumana',
    area: 'Broumana',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 250,
    sale_price: null,
    rent_price: 1500.0,
    furnishing: 'Partly Furnished',
    description: '250 sqm semi-furnished apartment in the heart of Broumana. 3 bedrooms, walk-in closet, chimney and large salon.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Prime Broumana promenade location. Near restaurants, shops and entertainment.',
  },
  {
    id: '766563',
    title: 'Luxury 4BR Summer Home - Broumana',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Broumana',
    area: 'Broumana',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 300,
    sale_price: null,
    rent_price: 2000.0,
    furnishing: 'Furnished',
    description: '300 sqm furnished luxury apartment with mountain and partial sea views. 4 bedrooms, chimney, large salon and premium kitchen.',
    view: 'Mountain & Sea View',
    image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'One of Broumana\'s most prestigious addresses. Ideal summer or year-round rental.',
  },
  {
    id: '974628',
    title: 'Sea View 3BR - Adma',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Adma',
    area: 'Adma',
    bedrooms: 3,
    bathrooms: 4,
    built_up_area: 230,
    sale_price: null,
    rent_price: 2600.0,
    furnishing: 'Furnished',
    description: '230 sqm furnished apartment with full sea views and 20 sqm balcony. 3 bedrooms, 4 bathrooms, premium kitchen and spacious salon.',
    view: 'Full Sea View',
    image_url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 20.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Prestigious Adma enclave with 24/7 security. Near beaches and Kaslik.',
  },
  {
    id: '482554',
    title: 'Luxury Sea View 4BR - Adma',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Adma',
    area: 'Adma',
    bedrooms: 4,
    bathrooms: 4,
    built_up_area: 290,
    sale_price: null,
    rent_price: 3200.0,
    furnishing: 'Fully Furnished',
    description: '290 sqm fully furnished trophy apartment with 30 sqm terrace and panoramic sea views. 4 master bedrooms each with en-suite.',
    view: 'Full Sea View',
    image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 30.0,
    maids_room: true,
    balconies: 2,
    electricity_24_7: true,
    notes: 'Adma\'s ultra-premium residential offering. Gated community atmosphere.',
  },
  {
    id: '270555',
    title: '3BR Family Apartment - Mansourieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Mansourieh',
    area: 'Mansourieh',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 175,
    sale_price: null,
    rent_price: 1100.0,
    furnishing: 'Furnished',
    description: '175 sqm furnished apartment in central Mansourieh. 3 bedrooms, 3 bathrooms, maid\'s room and fitted kitchen.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'hot_listing',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Convenient Mansourieh location. Easy access to Beirut and Metn highways.',
  },
  {
    id: '488162',
    title: '2BR Apartment - Mansourieh',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Mansourieh',
    area: 'Mansourieh',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 140,
    sale_price: null,
    rent_price: 800.0,
    furnishing: 'Furnished',
    description: '140 sqm furnished apartment. 2 bedrooms, 2 bathrooms, fitted kitchen and bright salon.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Good monthly rental value in Mansourieh.',
  },
  {
    id: '472528',
    title: 'Sea View 3BR - Batroun',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Batroun',
    area: 'Batroun',
    bedrooms: 3,
    bathrooms: 2,
    built_up_area: 180,
    sale_price: null,
    rent_price: 1800.0,
    furnishing: 'Furnished',
    description: '180 sqm furnished apartment with partial sea views over the Mediterranean. 3 bedrooms, 2 bathrooms, balcony and bright living area.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Walking distance to Batroun Old Souk, White Beach and Phoenician Wall.',
  },
  {
    id: '319684',
    title: 'Coastal 2BR Apartment - Batroun',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Batroun',
    area: 'Batroun',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 150,
    sale_price: null,
    rent_price: 1200.0,
    furnishing: 'Furnished',
    description: '150 sqm furnished coastal apartment. 2 bedrooms, 2 bathrooms and bright salon with sea breeze.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Charming Batroun living. Strong short-term rental potential.',
  },
  {
    id: '802729',
    title: 'Historic Town 3BR - Byblos',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Byblos (Jbeil)',
    area: 'Byblos (Jbeil)',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 190,
    sale_price: null,
    rent_price: 1600.0,
    furnishing: 'Furnished',
    description: '190 sqm furnished apartment in Byblos with partial sea views. 3 bedrooms, 3 bathrooms, modern kitchen and spacious salon.',
    view: 'Sea View',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Steps from Byblos Port and the famous Crusader Castle. Vibrant cultural and lifestyle hub.',
  },
  {
    id: '379946',
    title: '2BR Apartment - Byblos',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Byblos (Jbeil)',
    area: 'Byblos (Jbeil)',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 150,
    sale_price: null,
    rent_price: 1000.0,
    furnishing: 'Furnished',
    description: '150 sqm furnished apartment in Byblos. 2 bedrooms, 2 bathrooms, fitted kitchen and comfortable living area.',
    view: 'Partial Sea View',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Great for professionals and tourists looking for coastal living.',
  },
  {
    id: '835911',
    title: 'Mountain View 2BR - Ghosta',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Ghosta',
    area: 'Ghosta',
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 160,
    sale_price: null,
    rent_price: 800.0,
    furnishing: 'Furnished',
    description: '160 sqm furnished apartment in a calm Ghosta street. 2 bedrooms, 2 bathrooms, fitted kitchen and bright salon.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Private and peaceful. Easy access to Jounieh and Dbayeh highways.',
  },
  {
    id: '816751',
    title: '3BR Duplex - Ghosta',
    listing_type: 'rent',
    property_type: 'Duplex',
    city: 'Ghosta',
    area: 'Ghosta',
    bedrooms: 3,
    bathrooms: 2,
    built_up_area: 190,
    sale_price: null,
    rent_price: 1200.0,
    furnishing: 'Furnished',
    description: '190 sqm furnished duplex with chimney and mountain views. 3 bedrooms, 2 bathrooms, indoor staircase and private terrace.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
    status: 'available',
    parking: 1,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: false,
    balconies: 1,
    electricity_24_7: false,
    notes: 'Charming and unique property in Ghosta\'s residential heart.',
  },
  {
    id: '779514',
    title: '3BR Garden Apartment - Bsalim',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Bsalim',
    area: 'Bsalim',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 190,
    sale_price: null,
    rent_price: 1400.0,
    furnishing: 'Partly Furnished',
    description: '190 sqm semi-furnished apartment with 50 sqm private garden. 3 bedrooms, maid\'s room, fitted kitchen and spacious salon.',
    view: 'Mountain View',
    image_url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: 50.0,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Grand elegant building in a peaceful Bsalim site. Near schools and main roads.',
  },
  {
    id: '174870',
    title: 'Prestigious 3BR - Kornet Chehwan',
    listing_type: 'rent',
    property_type: 'Apartment',
    city: 'Kornet Chehwan',
    area: 'Kornet Chehwan',
    bedrooms: 3,
    bathrooms: 3,
    built_up_area: 180,
    sale_price: null,
    rent_price: 1300.0,
    furnishing: 'Partly Furnished',
    description: '180 sqm prestigious apartment in Kornet Chehwan with mountain and sea views. 3 bedrooms, gypsum ceilings, marble floors and double-glazed windows.',
    view: 'Mountain & Sea View',
    image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
    status: 'available',
    parking: 2,
    elevator: true,
    generator: false,
    terrace_area: null,
    maids_room: true,
    balconies: 1,
    electricity_24_7: true,
    notes: 'Serene prestigious street. One of Metn\'s finest residential addresses.',
  }
];

// Unsplash image pool for listings loaded from the API (no image_url in backend)
const UNSPLASH_POOL = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop',
];

// Map a raw backend listing object to the frontend Listing type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeListing(raw: any): Listing {
  const numId = Number(raw.id) || 0;
  const imageUrl = raw.image_url || UNSPLASH_POOL[Math.abs(numId) % UNSPLASH_POOL.length];

  // Backend has is_available (bool), frontend uses status string
  const status = raw.is_available === false ? 'sold' : 'available';

  // parking is a string in the backend ("1", "2", "Covered", "None")
  let parking: number | null = null;
  if (raw.parking && raw.parking !== 'None') {
    const p = parseInt(raw.parking, 10);
    parking = Number.isFinite(p) ? p : null;
  }

  return {
    id: String(raw.id),
    title: raw.title || '',
    listing_type: raw.listing_type as 'buy' | 'rent',
    property_type: raw.property_type || '',
    city: raw.city || '',
    area: raw.area || raw.city || '',
    bedrooms: raw.bedrooms ?? 0,
    bathrooms: raw.bathrooms ?? 0,
    built_up_area: raw.built_up_area ?? 0,
    sale_price: raw.sale_price ?? null,
    rent_price: raw.rent_price ?? null,
    furnishing: raw.furnishing || '',
    description: raw.description || '',
    view: raw.view || '',
    image_url: imageUrl,
    status,
    parking,
    elevator: raw.elevator ?? false,
    generator: raw.generator ?? false,
    terrace_area: raw.terrace_area ?? null,
    maids_room: raw.maids_room ?? false,
    balconies: raw.balconies ?? null,
    electricity_24_7: raw.electricity_24_7 ?? false,
    notes: raw.notes || '',
  };
}

const formatPrice = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString();
};

const formatNumberInput = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString();
};

const parseNumberInput = (value: string): number | null => {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return null;
  const num = Number(digits);
  return Number.isFinite(num) ? num : null;
};

// Listing Detail Drawer

function ListingDrawer({
  listing,
  onClose,
  onDelete,
  onEdit,
}: {
  listing: Listing;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (listing: Listing) => void;
}) {
  const status = listing.status || 'available';
  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.available;
  const price = listing.listing_type === 'buy' ? listing.sale_price : listing.rent_price;
  const pricePerSqm =
    price && listing.built_up_area
      ? Math.round(price / listing.built_up_area).toLocaleString()
      : 'N/A';

  const amenities: string[] = [];
  if (listing.elevator) amenities.push('Elevator');
  if (listing.generator) amenities.push('Generator');
  if (listing.electricity_24_7) amenities.push('24/7 Electricity');
  if (listing.maids_room) amenities.push("Maid's Room");
  if (listing.parking) amenities.push(`Parking x${listing.parking}`);
  if (listing.balconies) amenities.push(`Balconies x${listing.balconies}`);
  if (listing.terrace_area) amenities.push(`Terrace ${listing.terrace_area} m\u00b2`);

  return (
    <>
      {/* Backdrop */}
      <div className="bg-black/30 z-40" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }} onClick={onClose} />

      {/* Drawer panel */}
      <div className="bg-white shadow-xl z-50 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, height: '100vh', width: '500px', maxWidth: '100vw' }}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Building2 size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 line-clamp-2">{listing.title}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                <MapPin size={13} />
                <span>
                  {listing.city}
                  {listing.area && listing.area !== listing.city ? `, ${listing.area}` : ''}
                </span>
              </div>
              <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 mt-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-7">
          {/* Cover photo */}
          {listing.image_url && (
            <div className="h-52 rounded-xl overflow-hidden">
              <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{listing.description}</p>
            </section>
          )}

          {/* Listing Details */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Listing Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Property ID', value: listing.id },
                { label: 'Type', value: listing.property_type },
                { label: 'Bedrooms', value: String(listing.bedrooms) },
                { label: 'Bathrooms', value: String(listing.bathrooms) },
                { label: 'Area', value: listing.built_up_area ? `${listing.built_up_area} m\u00b2` : 'N/A' },
                { label: 'Furnishing', value: listing.furnishing || 'N/A' },
                { label: 'View', value: listing.view || 'N/A' },
                { label: 'Listing Type', value: listing.listing_type === 'buy' ? 'For Sale' : 'For Rent' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pricing</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500">List Price</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  ${formatPrice(price)}{listing.listing_type === 'rent' ? '/mo' : ''}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500">Price per m&sup2;</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">${pricePerSqm}</p>
              </div>
            </div>
          </section>

          {/* Amenities */}
          {amenities.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span key={a} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium border border-brand-100">
                    {a}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {listing.notes && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{listing.notes}</p>
            </section>
          )}

          {/* AI Matching Rules */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AI Matching Rules</h3>
            <div className="space-y-2">
              {AI_RULES.map((rule, i) => (
                <div key={i} className="flex items-start gap-2 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">{rule}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tour Availability */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tour Availability</h3>
            <div className="space-y-2">
              {TOUR_SLOTS.map((slot, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-sm text-slate-700">{slot}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-100 text-emerald-700">Available</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button
            onClick={() => onEdit(listing)}
            className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Edit Listing
          </button>
          <button
            onClick={() => onDelete(listing.id)}
            className="flex-1 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            Delete Listing
          </button>
        </div>
      </div>
    </>
  );
}

// Add Listing Modal

const EMPTY_FORM = {
  title: '',
  listing_type: 'rent',
  property_type: 'Apartment',
  city: '',
  area: '',
  price: '',
  bedrooms: 1,
  bathrooms: 1,
  built_up_area: '',
  furnishing: 'Unfurnished',
  description: '',
  additional_details: '',
};

function AddListingModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  // Photo state
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [propertyPreviews, setPropertyPreviews] = useState<string[]>([]);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef<any>(null);

  const compressImage = (file: File, callback: (dataUrl: string) => void) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 300;
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize; }
      } else {
        if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.8));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (dataUrl) => setCoverPreview(dataUrl));
  };

  const handlePropertyPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const processNext = (index: number) => {
      if (index >= files.length) return;
      compressImage(files[index], (dataUrl) => {
        setPropertyPreviews((prev) => [...prev, dataUrl]);
        setTimeout(() => processNext(index + 1), 0);
      });
    };
    processNext(0);
  };

  const removePropertyPhoto = (index: number) => {
    setPropertyPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const parseVoiceInput = (transcript: string) => {
    const text = transcript.toLowerCase();
    const updates: Partial<typeof EMPTY_FORM> = {};

    const bedroomMatch = text.match(/(\d+)\s*(?:bedroom|bed|غرفة|ghorfe|ghorf)/);
    if (bedroomMatch) updates.bedrooms = parseInt(bedroomMatch[1]);

    const bathroomMatch = text.match(/(\d+)\s*(?:bathroom|bath|حمام|hamam)/);
    if (bathroomMatch) updates.bathrooms = parseInt(bathroomMatch[1]);

    const priceMatch = text.match(/(\d[\d,]*)\s*(?:dollar|usd|\$|دولار)/);
    if (priceMatch) updates.price = priceMatch[1].replace(/,/g, '');

    const areaMatch = text.match(/(\d+)\s*(?:sqm|m2|square meter|متر|meter)/);
    if (areaMatch) updates.built_up_area = areaMatch[1];

    const locations = [
      'achrafieh', 'hamra', 'verdun', 'raouche', 'jounieh', 'kaslik',
      'broumana', 'bsalim', 'mtayleb', 'rabieh', 'mansourieh', 'baabda',
      'hazmieh', 'dbayeh', 'antelias', 'jal el dib', 'naccache', 'ghosta',
      'beit meri', 'batroun', 'byblos', 'adma', 'zikrit', 'kornet chehwan',
    ];
    for (const loc of locations) {
      if (text.includes(loc)) {
        const title = loc.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
        updates.city = title;
        updates.area = title;
        break;
      }
    }

    if (text.includes('villa')) updates.property_type = 'Villa';
    else if (text.includes('penthouse')) updates.property_type = 'Penthouse';
    else if (text.includes('studio')) updates.property_type = 'Studio';
    else if (text.includes('duplex')) updates.property_type = 'Duplex';
    else if (text.includes('apartment') || text.includes('flat')) updates.property_type = 'Apartment';

    if (text.match(/for rent|to rent|ajar|إيجار/)) updates.listing_type = 'rent';
    else if (text.match(/for sale|to sale|for buy|بيع/)) updates.listing_type = 'buy';

    if (Object.keys(updates).length === 0) {
      updates.description = transcript;
    }

    setForm((prev) => ({ ...prev, ...updates }));
    const filled = Object.keys(updates).join(', ');
    setVoiceStatus(filled ? `Filled: ${filled}` : 'Nothing detected');
  };

  const startRecording = async () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Voice input is not supported on this browser');
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setVoiceStatus('Microphone access denied. Please allow it in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setVoiceStatus('No microphone found on this device.');
      } else {
        setVoiceStatus('Voice input failed. Try using Chrome for best compatibility.');
      }
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      parseVoiceInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = (event: any) => {
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        setVoiceStatus('Microphone access denied. Please allow it in your browser settings.');
      } else if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setVoiceStatus('No microphone found on this device.');
      } else {
        setVoiceStatus('Voice input failed. Try using Chrome for best compatibility.');
      }
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setVoiceStatus('Listening...');
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-black/40 z-40" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="bg-white shadow-xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300" style={{ height: '100vh', width: '520px', maxWidth: '100vw' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 flex-shrink-0">
            <h3 className="text-base font-semibold text-slate-900">Add Listing</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Photo Upload */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cover Photo</label>
                {coverPreview ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={coverPreview} alt="Cover" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverPreview(null)}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-brand-400 transition-colors">
                    <Upload size={20} className="text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">Click to upload cover photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverPhotoChange}
                    />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Photos</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 hover:border-brand-400 transition-colors">
                  {propertyPreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {propertyPreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square">
                          <img
                            src={src}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removePropertyPhoto(i)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-brand-600 transition-colors">
                    <Upload size={15} />
                    <span className="text-xs">Add photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePropertyPhotosChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Core Fields */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Modern 3BR Apartment in Achrafieh"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Listing Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.listing_type}
                  onChange={(e) => setForm({ ...form, listing_type: e.target.value })}
                >
                  <option value="rent">For Rent</option>
                  <option value="buy">For Sale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.property_type}
                  onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                >
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Studio</option>
                  <option>Villa</option>
                  <option>Penthouse</option>
                  <option>Duplex</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Beirut"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Area / Neighborhood</label>
                <input
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Achrafieh"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {form.listing_type === 'buy' ? 'Sale Price ($)' : 'Rent Price ($)'}
              </label>
              <input
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. 250,000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: formatNumberInput(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Built-up Area (m&sup2;)</label>
                <input
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. 120"
                  value={form.built_up_area}
                  onChange={(e) => setForm({ ...form, built_up_area: formatNumberInput(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Furnishing</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.furnishing}
                  onChange={(e) => setForm({ ...form, furnishing: e.target.value })}
                >
                  <option>Unfurnished</option>
                  <option>Furnished</option>
                  <option>Semi-Furnished</option>
                  <option>Fully Furnished</option>
                  <option>Partly Furnished</option>
                </select>
              </div>
            </div>

            {/* Additional Details */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                onClick={() => setShowAdditional((v) => !v)}
              >
                <span>Additional Details</span>
                {showAdditional ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showAdditional && (
                <div className="px-4 py-3">
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    placeholder="Add any additional details about the property (parking, floor, amenities, etc.)"
                    value={form.additional_details}
                    onChange={(e) => setForm({ ...form, additional_details: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Voice Fill */}
            <style>{`@keyframes waveBar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}`}</style>
            <div className="flex items-center gap-3">
              {isRecording ? (
                <div className="flex items-center gap-3 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <div className="flex items-center gap-0.5" style={{ height: '20px' }}>
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        style={{
                          animation: `waveBar 0.7s ease-in-out ${i * 0.1}s infinite`,
                          transformOrigin: 'center',
                          height: '18px',
                          width: '4px',
                        }}
                        className="bg-red-500 rounded-full"
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center justify-center w-7 h-7 bg-red-600 rounded-full hover:bg-red-700 transition-colors flex-shrink-0"
                    title="Stop recording"
                  >
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <Mic size={15} />
                  Voice Fill
                </button>
              )}
              {voiceStatus && (
                <span className="text-xs text-slate-400">{voiceStatus}</span>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Edit Listing Modal

type EditForm = {
  title: string;
  listing_type: string;
  property_type: string;
  city: string;
  area: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  built_up_area: string;
  description: string;
};

function EditListingModal({
  listing,
  onClose,
  onSave,
}: {
  listing: Listing;
  onClose: () => void;
  onSave: (id: string, data: EditForm) => Promise<void>;
}) {
  const currentPrice = listing.listing_type === 'buy' ? listing.sale_price : listing.rent_price;
  const [form, setForm] = useState<EditForm>({
    title: listing.title || '',
    listing_type: listing.listing_type || 'rent',
    property_type: listing.property_type || 'Apartment',
    city: listing.city || '',
    area: listing.area || '',
    price: currentPrice ? String(currentPrice) : '',
    bedrooms: listing.bedrooms || 0,
    bathrooms: listing.bathrooms || 0,
    built_up_area: listing.built_up_area ? String(listing.built_up_area) : '',
    description: listing.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(listing.id, form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-black/40 z-[60]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }} onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex justify-end">
        <div className="bg-white shadow-xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300" style={{ height: '100vh', width: '520px', maxWidth: '100vw' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 flex-shrink-0">
            <h3 className="text-base font-semibold text-slate-900">Edit Listing</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Listing Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.listing_type}
                  onChange={(e) => setForm({ ...form, listing_type: e.target.value })}
                >
                  <option value="rent">For Rent</option>
                  <option value="buy">For Sale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.property_type}
                  onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                >
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Studio</option>
                  <option>Villa</option>
                  <option>Penthouse</option>
                  <option>Duplex</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Area / Neighborhood</label>
                <input
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {form.listing_type === 'buy' ? 'Sale Price ($)' : 'Rent Price ($/mo)'}
              </label>
              <input
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. 250,000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: formatNumberInput(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Built-up Area (m&sup2;)</label>
              <input
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. 120"
                value={form.built_up_area}
                onChange={(e) => setForm({ ...form, built_up_area: formatNumberInput(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Status pill component

interface StatusBadgeConfig {
  bg: string;
  text: string;
  label: string;
}

const STATUS_BADGE_MAP: Record<string, StatusBadgeConfig> = {
  available: { bg: 'bg-green-50', text: 'text-green-700', label: 'Available' },
  hot_listing: { bg: 'bg-red-50', text: 'text-red-600', label: 'Hot' },
  under_offer: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Under Offer' },
  sold: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Sold' },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_BADGE_MAP[status] ?? STATUS_BADGE_MAP.available;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

const ITEMS_PER_PAGE = 12;

// Main Page

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'rent'>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [bedroomsFilter, setBedroomsFilter] = useState('');
  const [propTypeFilter, setPropTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  // Mobile chip filter: 'All' | listing_type | city
  const [chipFilter, setChipFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await getListings();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any[] = res.data || [];
      if (raw.length > 0) {
        setListings(raw.map(normalizeListing));
      } else {
        setListings(MOCK_LISTINGS);
      }
    } catch {
      setListings(MOCK_LISTINGS);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await deleteListing(Number(id));
      setSelectedListing(null);
      toast.success('Listing deleted.');
      await loadListings();
    } catch (err) {
      console.warn('[Listings] Delete failed:', err);
      toast.error('Failed to delete listing.');
    }
  };

  const handleAddListing = async (data: typeof EMPTY_FORM) => {
    const parsed = parseNumberInput(data.price);
    const payload = {
      title: data.title,
      listing_type: data.listing_type,
      property_type: data.property_type,
      category: 'Residential',
      city: data.city,
      area: data.area || null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      built_up_area: parseNumberInput(data.built_up_area),
      furnishing: data.furnishing,
      sale_price: data.listing_type === 'buy' ? parsed : null,
      rent_price: data.listing_type === 'rent' ? parsed : null,
    };
    try {
      await createListing(payload);
      toast.success('Listing added.');
    } catch {
      const localId = `local-${Date.now()}`;
      const localListing: Listing = {
        id: localId,
        title: payload.title,
        listing_type: payload.listing_type as 'buy' | 'rent',
        property_type: payload.property_type,
        city: payload.city,
        area: payload.area || '',
        bedrooms: payload.bedrooms,
        bathrooms: payload.bathrooms,
        built_up_area: payload.built_up_area || 0,
        sale_price: payload.sale_price,
        rent_price: payload.rent_price,
        furnishing: payload.furnishing,
        description: '',
        view: '',
        image_url: '',
        status: 'available',
        parking: null,
        elevator: false,
        generator: false,
        terrace_area: null,
        maids_room: false,
        balconies: null,
        electricity_24_7: false,
        notes: '',
      };
      setListings((prev) => [localListing, ...prev]);
      toast.success('Listing added locally (server sync pending).');
    }
    setShowAddModal(false);
    loadListings();
  };

  const handleEditListing = async (id: string, data: EditForm) => {
    const parsed = parseNumberInput(data.price);
    const payload = {
      title: data.title,
      listing_type: data.listing_type,
      property_type: data.property_type,
      city: data.city,
      area: data.area || null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      built_up_area: parseNumberInput(data.built_up_area),
      description: data.description,
      sale_price: data.listing_type === 'buy' ? parsed : null,
      rent_price: data.listing_type === 'rent' ? parsed : null,
    };
    try {
      await updateListing(Number(id), payload);
    } catch {
      // API may not support PUT yet; update local state as fallback
      setListings((prev) =>
        prev.map((l) => (l.id === id ? ({ ...l, ...payload } as Listing) : l)),
      );
      if (selectedListing?.id === id) {
        setSelectedListing((prev) => (prev ? ({ ...prev, ...payload } as Listing) : null));
      }
    }
    toast.success('Listing updated.');
    setShowEditModal(false);
    setEditingListing(null);
    loadListings();
  };

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, locationFilter, bedroomsFilter, propTypeFilter, search]);

  const getPrice = (l: Listing) =>
    l.listing_type === 'buy' ? l.sale_price : l.rent_price;

  const CHIP_FILTERS = ['All', 'Sale', 'Rent', 'Achrafieh', 'Jounieh', 'Broumana', 'Verdun', 'Hamra', 'Dbayeh'] as const;

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (typeFilter === 'buy' && l.listing_type !== 'buy') return false;
      if (typeFilter === 'rent' && l.listing_type !== 'rent') return false;
      if (locationFilter && l.city !== locationFilter) return false;
      if (bedroomsFilter) {
        const minBeds = parseInt(bedroomsFilter, 10);
        if (l.bedrooms < minBeds) return false;
      }
      if (propTypeFilter && l.property_type !== propTypeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.title?.toLowerCase().includes(q) &&
          !l.city?.toLowerCase().includes(q) &&
          !l.area?.toLowerCase().includes(q)
        ) return false;
      }
      // Mobile chip filter
      if (chipFilter === 'Sale' && l.listing_type !== 'buy') return false;
      if (chipFilter === 'Rent' && l.listing_type !== 'rent') return false;
      if (chipFilter !== 'All' && chipFilter !== 'Sale' && chipFilter !== 'Rent') {
        if (!l.city?.toLowerCase().includes(chipFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [listings, typeFilter, locationFilter, bedroomsFilter, propTypeFilter, search, chipFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalCount = listings.length;
  const availableCount = listings.filter((l) => l.status === 'available' || l.status === 'hot_listing').length;
  const underOfferCount = listings.filter((l) => l.status === 'under_offer').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;

  const locations = useMemo(
    () => [...new Set(listings.map((l) => l.city).filter(Boolean))].sort(),
    [listings],
  );
  const propTypes = useMemo(
    () => [...new Set(listings.map((l) => l.property_type).filter(Boolean))].sort(),
    [listings],
  );

  const hasActiveFilters = !!(locationFilter || bedroomsFilter || propTypeFilter);

  return (
    <div className="space-y-4 px-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Listings</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">{totalCount} properties in your portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
            <Upload size={14} />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors min-h-[44px]"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add Listing</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="px-4 md:hidden">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder:text-slate-400"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile horizontal filter chips */}
      <div className="md:hidden px-4 overflow-x-auto">
        <div className="flex gap-2 pb-2 w-max">
          {CHIP_FILTERS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setChipFilter(chip)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all min-h-[36px] ${
                chipFilter === chip
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row - hidden on mobile, 2-col on sm, 4-col on md+ */}
      <div className="hidden md:grid grid-cols-4 gap-3 px-0">
        {[
          { label: 'Total Listings', value: totalCount, color: 'text-slate-900', sub: 'In portfolio' },
          { label: 'Available', value: availableCount, color: 'text-green-700', sub: 'Actively marketed' },
          { label: 'Under Offer', value: underOfferCount, color: 'text-amber-700', sub: 'Negotiation stage' },
          { label: 'Sold / Rented', value: soldCount, color: 'text-slate-400', sub: 'This quarter' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
            <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Mobile 2-col stats strip */}
      <div className="md:hidden grid grid-cols-2 gap-2 px-4">
        {[
          { label: 'Total', value: totalCount, color: 'text-slate-900' },
          { label: 'Available', value: availableCount, color: 'text-green-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
            <p className={`text-2xl font-black mt-0.5 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Controls Bar - desktop only */}
      <div className="hidden md:flex items-center gap-2.5 bg-white rounded-xl border border-slate-200 px-4 py-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder:text-slate-400"
            placeholder="Search by area, type, price..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1.5">
          {(['all', 'buy', 'rent'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                typeFilter === t
                  ? 'bg-blue-50 border-blue-600 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {t === 'all' ? 'All' : t === 'buy' ? 'For Sale' : 'For Rent'}
            </button>
          ))}
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 border-blue-600 text-blue-600'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal size={12} />
          Filters
          {hasActiveFilters && (
            <span className="w-4 h-4 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center leading-none">
              {[locationFilter, bedroomsFilter, propTypeFilter].filter(Boolean).length}
            </span>
          )}
        </button>

        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="List view"
          >
            <List size={14} />
          </button>
        </div>

        <span className="text-xs text-slate-400 whitespace-nowrap">{filtered.length} listings</span>
      </div>

      {/* Expanded Filters Panel - desktop only */}
      {showFilters && (
        <div className="hidden md:flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex-wrap">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={bedroomsFilter}
            onChange={(e) => setBedroomsFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Any Bedrooms</option>
            <option value="1">1+ Beds</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
            <option value="4">4+ Beds</option>
          </select>

          <select
            value={propTypeFilter}
            onChange={(e) => setPropTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Property Types</option>
            {propTypes.map((pt) => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setLocationFilter('');
                setBedroomsFilter('');
                setPropTypeFilter('');
              }}
              className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <Building2 className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No listings found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Grid View */}
      {!loading && filtered.length > 0 && view === 'grid' && (
        <>
          {/* Mobile: horizontal card list */}
          <div className="md:hidden flex flex-col gap-0 bg-white rounded-2xl border border-slate-200 overflow-hidden mx-4">
            {paged.map((l, idx) => {
              const price = getPrice(l);
              return (
                <div
                  key={l.id}
                  className={`flex flex-row h-[90px] cursor-pointer active:bg-slate-50 transition-colors ${idx < paged.length - 1 ? 'border-b border-slate-100' : ''}`}
                  onClick={() => setSelectedListing(l)}
                >
                  {/* Square image left */}
                  <div className="relative w-[90px] h-[90px] flex-shrink-0 bg-slate-100">
                    {l.image_url ? (
                      <img src={l.image_url} alt={l.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={24} className="text-slate-300" />
                      </div>
                    )}
                    {l.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[10px] font-black tracking-widest">SOLD</span>
                      </div>
                    )}
                    {l.status === 'hot_listing' && (
                      <div className="absolute top-1 left-1">
                        <span className="flex items-center gap-0.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          <Flame size={7} />HOT
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Info right */}
                  <div className="flex flex-col justify-center px-3 flex-1 min-w-0 gap-0.5">
                    <p className="text-sm font-bold text-slate-900 truncate leading-tight">{l.title}</p>
                    <p className="text-xs font-bold text-blue-600">${formatPrice(price)}{l.listing_type === 'rent' ? '/mo' : ''}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin size={10} />
                      <span className="truncate">{l.city}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {l.bedrooms > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] text-slate-600 font-medium">
                          <Bed size={10} />{l.bedrooms}BR
                        </span>
                      )}
                      {l.bathrooms > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] text-slate-600 font-medium">
                          <Bath size={10} />{l.bathrooms}BA
                        </span>
                      )}
                      <StatusPill status={l.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: original vertical card grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paged.map((l) => {
              const price = getPrice(l);
              return (
                <div
                  key={l.id}
                  className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${l.status === 'sold' ? 'opacity-80' : ''}`}
                  onClick={() => setSelectedListing(l)}
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    {l.image_url ? (
                      <img src={l.image_url} alt={l.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <Building2 size={40} className="text-slate-300" />
                      </div>
                    )}
                    {l.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                        <span className="text-white text-lg font-black tracking-widest">SOLD</span>
                      </div>
                    )}
                    {l.status === 'hot_listing' && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <Flame size={9} />HOT
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {l.listing_type === 'buy' ? 'For Sale' : 'For Rent'}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="bg-black/65 backdrop-blur-sm text-white text-[13px] font-black px-2.5 py-1 rounded-lg">
                        ${formatPrice(price)}{l.listing_type === 'rent' ? '/mo' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <h3 className="text-[13px] font-bold text-slate-900 leading-snug mb-1.5 line-clamp-1">{l.title}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2.5">
                      <MapPin size={11} />
                      <span className="line-clamp-1">{l.city}</span>
                    </div>
                    <div className="flex gap-3 mb-2.5">
                      {l.bedrooms > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                          <Bed size={11} />{l.bedrooms} bed{l.bedrooms !== 1 ? 's' : ''}
                        </span>
                      )}
                      {l.bathrooms > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                          <Bath size={11} />{l.bathrooms} bath{l.bathrooms !== 1 ? 's' : ''}
                        </span>
                      )}
                      {l.built_up_area > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                          <Maximize size={11} />{l.built_up_area}m&sup2;
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2.5 min-h-[22px]">
                      {l.generator && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Generator</span>
                      )}
                      {l.parking != null && l.parking > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Parking</span>
                      )}
                      {(l.furnishing === 'Fully Furnished' || l.furnishing === 'Furnished') && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">Furnished</span>
                      )}
                      {l.view && l.view.toLowerCase().includes('sea') && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Sea View</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-[10px] text-purple-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                        2 AI matches
                      </span>
                      <StatusPill status={l.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* List View */}
      {!loading && filtered.length > 0 && view === 'list' && (
        <div className="space-y-2">
          {paged.map((l) => {
            const price = getPrice(l);
            return (
              <div
                key={l.id}
                className="bg-white rounded-xl border border-slate-200 flex gap-4 p-3 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                onClick={() => setSelectedListing(l)}
              >
                {/* Thumbnail */}
                <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  {l.image_url ? (
                    <img src={l.image_url} alt={l.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={24} className="text-slate-300" />
                    </div>
                  )}
                  {l.status === 'hot_listing' && (
                    <div className="absolute top-1 left-1">
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">HOT</span>
                    </div>
                  )}
                  {l.status === 'sold' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-black tracking-widest">SOLD</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{l.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin size={11} />
                        <span>{l.city}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-sm font-black text-slate-900">
                        ${formatPrice(price)}{l.listing_type === 'rent' ? '/mo' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex gap-3">
                      {l.bedrooms > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                          <Bed size={11} />{l.bedrooms}
                        </span>
                      )}
                      {l.bathrooms > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                          <Bath size={11} />{l.bathrooms}
                        </span>
                      )}
                      {l.built_up_area > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                          <Maximize size={11} />{l.built_up_area}m&sup2;
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 ml-auto">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${l.listing_type === 'buy' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                        {l.listing_type === 'buy' ? 'For Sale' : 'For Rent'}
                      </span>
                      <StatusPill status={l.status} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else if (page <= 4) {
              pageNum = i < 6 ? i + 1 : totalPages;
            } else if (page >= totalPages - 3) {
              pageNum = i === 0 ? 1 : totalPages - 6 + i;
            } else {
              const mid = [1, page - 2, page - 1, page, page + 1, page + 2, totalPages];
              pageNum = mid[i];
            }
            return (
              <button
                key={`page-${pageNum}-${i}`}
                onClick={() => setPage(pageNum)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === pageNum
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>

          <span className="ml-2 text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedListing && (
        <ListingDrawer
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onDelete={handleDelete}
          onEdit={(l) => { setEditingListing(l); setShowEditModal(true); }}
        />
      )}

      {/* Edit Listing Modal */}
      {showEditModal && editingListing && (
        <EditListingModal
          listing={editingListing}
          onClose={() => { setShowEditModal(false); setEditingListing(null); }}
          onSave={handleEditListing}
        />
      )}

      {/* Add Listing Modal */}
      {showAddModal && (
        <AddListingModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddListing}
        />
      )}
    </div>
  );
}
