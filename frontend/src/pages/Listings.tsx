import { useState, useEffect } from 'react';
import { getListings, createListing, deleteListing, API_URL } from '../api';
import { Plus, Trash2, Home, MapPin, Bed, Bath, Search, Square } from 'lucide-react';

const formatPrice = (value: any) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString() : 'N/A';
};

const formatNumberInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString();
};

const parseNumberInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return null;
  const num = Number(digits);
  return Number.isFinite(num) ? num : null;
};

export default function Listings() {
  const [listings, setListings] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    listing_type: 'rent',
    property_type: 'Apartment',
    title: '',
    category: 'Residential',
    city: '',
    area: '',
    building_name: '',
    property_id: '',
    bedrooms: 1,
    bathrooms: 1,
    built_up_area: '',
    plot_area: '',
    floor_number: '',
    parking: 'None',
    property_age: '',
    furnishing: 'Unfurnished',
    view: '',
    condition: '',
    sale_price: '',
    rent_price: '',
    rental_duration: 'Monthly',
    security_deposit: '',
    negotiable: '',
    description: ''
  });

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getListings();
      setListings(res.data);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load listings. Check if backend is running and API URL is correct.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      if (form.listing_type === 'buy' && !form.sale_price) {
        setError('Sale price is required for buy listings.');
        return;
      }
      if (form.listing_type === 'rent' && !form.rent_price) {
        setError('Rent price is required for rent listings.');
        return;
      }

      const payload = {
        ...form,
        built_up_area: parseNumberInput(form.built_up_area),
        plot_area: parseNumberInput(form.plot_area),
        floor_number: parseNumberInput(form.floor_number),
        sale_price: parseNumberInput(form.sale_price),
        rent_price: parseNumberInput(form.rent_price),
        security_deposit: parseNumberInput(form.security_deposit),
        negotiable: form.negotiable === '' ? null : form.negotiable === 'Yes',
      };

      await createListing(payload);
      setForm({
        listing_type: 'rent',
        property_type: 'Apartment',
        title: '',
        category: 'Residential',
        property_id: '',
        city: '',
        area: '',
        building_name: '',
        bedrooms: 1,
        bathrooms: 1,
        built_up_area: '',
        plot_area: '',
        floor_number: '',
        parking: 'None',
        property_age: '',
        furnishing: 'Unfurnished',
        view: '',
        condition: '',
        sale_price: '',
        rent_price: '',
        rental_duration: 'Monthly',
        security_deposit: '',
        negotiable: '',
        description: ''
      });
      setIsFormOpen(false);
      loadListings();
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create listing. Check if backend is running and API URL is correct.';
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteListing(id);
      loadListings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
        <p className="text-yellow-800">
          <strong>API URL:</strong> {API_URL}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <p className="text-red-600 text-sm mt-1">
            Check browser console (F12) for details.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Property Listings
          </h1>
          <p className="text-slate-500">Manage your property portfolio.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Listing
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">
            New Property Details
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Listing Title
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Modern Apartment in Downtown"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Listing Type
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                value={form.listing_type}
                onChange={(e) =>
                  setForm({ ...form, listing_type: e.target.value })
                }
              >
                <option value="rent">For Rent</option>
                <option value="buy">For Sale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Property ID
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. 126225"
                value={form.property_id}
                onChange={(e) =>
                  setForm({ ...form, property_id: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Property Type
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                value={form.property_type}
                onChange={(e) =>
                  setForm({ ...form, property_type: e.target.value })
                }
              >
                <option>Apartment</option>
                <option>Villa</option>
                <option>Duplex</option>
                <option>Penthouse</option>
                <option>Office</option>
                <option>Retail</option>
                <option>Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Residential</option>
                <option>Commercial</option>
                <option>Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                City
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Beirut"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.bedrooms}
                  onChange={(e) =>
                    setForm({ ...form, bedrooms: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.bathrooms}
                  onChange={(e) =>
                    setForm({ ...form, bathrooms: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Built-Up Area (m²)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.built_up_area}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      built_up_area: formatNumberInput(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Plot Area (m²)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.plot_area}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      plot_area: formatNumberInput(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Area / Neighborhood
                </label>
                <input
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Achrafieh"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Furnishing
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.furnishing}
                  onChange={(e) =>
                    setForm({ ...form, furnishing: e.target.value })
                  }
                >
                  <option>Unfurnished</option>
                  <option>Furnished</option>
                  <option>Semi-Furnished</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Building Name
                </label>
                <input
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.building_name}
                  onChange={(e) =>
                    setForm({ ...form, building_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Floor Number
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.floor_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      floor_number: formatNumberInput(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Parking
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.parking}
                  onChange={(e) =>
                    setForm({ ...form, parking: e.target.value })
                  }
                >
                  <option>None</option>
                  <option>1</option>
                  <option>2</option>
                  <option>Covered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Property Age
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.property_age}
                  onChange={(e) =>
                    setForm({ ...form, property_age: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option>1-5 years</option>
                  <option>5-10 years</option>
                  <option>10+ years</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  View
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.view}
                  onChange={(e) => setForm({ ...form, view: e.target.value })}
                >
                  <option value="">Select</option>
                  <option>Sea</option>
                  <option>City</option>
                  <option>Mountain</option>
                  <option>Open</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Condition
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={form.condition}
                  onChange={(e) =>
                    setForm({ ...form, condition: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option>Ready to Move In</option>
                  <option>Under Construction</option>
                  <option>Needs Renovation</option>
                </select>
              </div>
            </div>

            {form.listing_type === "buy" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sale Price ($)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.sale_price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sale_price: formatNumberInput(e.target.value),
                    })
                  }
                  required
                />
              </div>
            )}

            {form.listing_type === "rent" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rent Price ($)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={form.rent_price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rent_price: formatNumberInput(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rental Duration
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    value={form.rental_duration}
                    onChange={(e) =>
                      setForm({ ...form, rental_duration: e.target.value })
                    }
                  >
                    <option>Daily</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                  </select>
                </div>
              </div>
            )}

            {form.listing_type === "rent" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Security Deposit ($)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={form.security_deposit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        security_deposit: formatNumberInput(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Negotiable
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    value={form.negotiable}
                    onChange={(e) =>
                      setForm({ ...form, negotiable: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                rows={3}
                placeholder="Additional details..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg"
              >
                Save Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-slate-500">Loading listings...</p>
        </div>
      )}

      {/* Grid Layout for Listings */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-slate-200 relative">
                {/* Placeholder for Image */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <Home size={48} />
                </div>
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      l.listing_type === "rent"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-brand-100 text-brand-700"
                    }`}
                  >
                    {l.listing_type === "rent" ? "For Rent" : "For Sale"}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-slate-900 shadow-sm">
                    $
                    {l.listing_type === "buy"
                      ? formatPrice(l.sale_price)
                      : formatPrice(l.rent_price)}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-900 line-clamp-1">
                    {l.title}
                  </h3>
                </div>

                <div className="flex items-center text-slate-500 text-sm mb-2">
                  <MapPin size={16} className="mr-1" />
                  {l.city}
                  {l.area ? `, ${l.area}` : ""}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    <Square size={16} />
                    <span>{formatPrice(l.built_up_area)} m²</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed size={16} />
                    <span>{l.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath size={16} />
                    <span>{l.bathrooms} Baths</span>
                  </div>
                  {l.furnishing && (
                    <div className="capitalize px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                      {l.furnishing}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">ID: {l.id}</span>
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && listings.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <Home className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-900">
            No properties yet
          </h3>
          <p className="text-slate-500">Get started by adding a new listing.</p>
        </div>
      )}
    </div>
  );
}
