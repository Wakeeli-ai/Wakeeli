import { useState, useEffect } from 'react';
import { getListings, createListing, deleteListing } from '../api';
import {
  Building2, Bed, Bath, Maximize, X, MapPin, Search, Loader2,
} from 'lucide-react';

// Types

type Listing = {
  id: number;
  title: string;
  listing_type: string;
  property_type: string;
  city: string;
  area: string | null;
  bedrooms: number;
  bathrooms: number;
  built_up_area: number | null;
  sale_price: number | null;
  rent_price: number | null;
  furnishing: string | null;
  property_id?: string;
};

type ListingStatus = 'Active' | 'Hot Listing' | 'Pending' | 'Inactive';

// Helpers

const STATUS_COLORS: Record<ListingStatus, string> = {
  Active: 'bg-emerald-500 text-white',
  'Hot Listing': 'bg-red-500 text-white',
  Pending: 'bg-amber-500 text-white',
  Inactive: 'bg-slate-400 text-white',
};

const STATUSES: ListingStatus[] = ['Active', 'Hot Listing', 'Pending', 'Inactive'];

function mockStatus(id: number): ListingStatus {
  return STATUSES[id % STATUSES.length];
}

const AMENITY_POOL = [
  'Swimming Pool', 'Gym', 'Parking', 'Balcony', 'Sea View',
  'Security', 'Elevator', 'Generator', 'Storage', 'Central AC',
];

function mockAmenities(id: number): string[] {
  return AMENITY_POOL.filter((_, i) => (id + i) % 3 === 0).slice(0, 5);
}

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

const formatPrice = (value: any): string => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString() : 'N/A';
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
}: {
  listing: Listing;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const status = mockStatus(listing.id);
  const amenities = mockAmenities(listing.id);
  const price = listing.listing_type === 'buy' ? listing.sale_price : listing.rent_price;
  const pricePerSqm =
    price && listing.built_up_area
      ? Math.round(price / listing.built_up_area).toLocaleString()
      : 'N/A';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-[500px] max-w-full bg-white shadow-xl z-50 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
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
                  {listing.area ? `, ${listing.area}` : ''}
                </span>
              </div>
              <span
                className={`inline-flex mt-1.5 px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status]}`}
              >
                {status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 mt-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-7">
          {/* Listing Details */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Listing Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Property ID', value: listing.property_id || `#${listing.id}` },
                { label: 'Type', value: listing.property_type },
                { label: 'Bedrooms', value: String(listing.bedrooms) },
                { label: 'Bathrooms', value: String(listing.bathrooms) },
                {
                  label: 'Area',
                  value: listing.built_up_area ? `${listing.built_up_area} m\u00b2` : 'N/A',
                },
                { label: 'Furnishing', value: listing.furnishing || 'N/A' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-50 rounded-lg p-3 border border-slate-100"
                >
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Pricing
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500">List Price</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">${formatPrice(price)}</p>
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
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span
                    key={a}
                    className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium border border-brand-100"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* AI Matching Rules */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              AI Matching Rules
            </h3>
            <div className="space-y-2">
              {AI_RULES.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">{rule}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tour Availability */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Tour Availability
            </h3>
            <div className="space-y-2">
              {TOUR_SLOTS.map((slot, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="text-sm text-slate-700">{slot}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-100 text-emerald-700">
                    Available
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
            Edit Listing
          </button>
          <button
            onClick={() => {
              onDelete(listing.id);
              onClose();
            }}
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
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
            <h3 className="text-base font-semibold text-slate-900">Add Listing</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Listing Type
                </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Property Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.property_type}
                  onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                >
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Studio</option>
                  <option>Villa</option>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Area / Neighborhood
                </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Built-up Area (m&sup2;)
                </label>
                <input
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. 120"
                  value={form.built_up_area}
                  onChange={(e) =>
                    setForm({ ...form, built_up_area: formatNumberInput(e.target.value) })
                  }
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
                </select>
              </div>
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

// Main Page

export default function Listings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await getListings();
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await deleteListing(id);
      setSelectedListing(null);
      loadListings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddListing = async (data: typeof EMPTY_FORM) => {
    const parsed = parseNumberInput(data.price);
    await createListing({
      title: data.title,
      listing_type: data.listing_type,
      property_type: data.property_type,
      city: data.city,
      area: data.area || null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      built_up_area: parseNumberInput(data.built_up_area),
      furnishing: data.furnishing,
      sale_price: data.listing_type === 'buy' ? parsed : null,
      rent_price: data.listing_type === 'rent' ? parsed : null,
    });
    setShowAddModal(false);
    loadListings();
  };

  const filtered = listings.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.title?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q) ||
      l.area?.toLowerCase().includes(q)
    );
  });

  const forSaleCount = listings.filter((l) => l.listing_type === 'buy').length;
  const forRentCount = listings.filter((l) => l.listing_type === 'rent').length;

  const getPrice = (l: any) =>
    l.listing_type === 'buy' ? l.sale_price : l.rent_price;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Listings</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">
              For Sale: {forSaleCount}
            </span>
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
              For Rent: {forRentCount}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-56"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Building2 size={16} />
            Add Listing
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No listings found</h3>
              <p className="text-slate-500 text-sm mt-1">
                Add a listing or adjust your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((l) => {
                const status = mockStatus(l.id);
                const price = getPrice(l);

                return (
                  <div
                    key={l.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedListing(l)}
                  >
                    {/* Image placeholder */}
                    <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <Building2 size={52} />
                      </div>

                      {/* Status badge top-left */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${STATUS_COLORS[status]}`}
                        >
                          {status}
                        </span>
                      </div>

                      {/* Price badge top-right */}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-slate-900/80 backdrop-blur rounded-full text-xs font-bold text-white shadow-sm">
                          ${formatPrice(price)}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">{l.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                        <MapPin size={13} className="flex-shrink-0" />
                        <span className="line-clamp-1">
                          {l.city}
                          {l.area ? `, ${l.area}` : ''}
                        </span>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Bed size={14} />
                          {l.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath size={14} />
                          {l.bathrooms}
                        </span>
                        {l.built_up_area && (
                          <span className="flex items-center gap-1">
                            <Maximize size={14} />
                            {l.built_up_area} m&sup2;
                          </span>
                        )}
                      </div>

                      {/* Listing type badge */}
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          l.listing_type === 'buy'
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {l.listing_type === 'buy' ? 'For Sale' : 'For Rent'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Detail Drawer */}
      {selectedListing && (
        <ListingDrawer
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onDelete={handleDelete}
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
