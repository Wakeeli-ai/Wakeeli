import { useState, useEffect } from 'react';
import { getListings, createListing, deleteListing } from '../api';
import { Plus, Trash2, Home, MapPin, Bed, Bath, Search } from 'lucide-react';

export default function Listings() {
  const [listings, setListings] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    listing_type: 'rent',
    price: 0,
    location: '',
    bedrooms: 1,
    furnishing: 'unfurnished',
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
      await createListing(form);
      setForm({
        title: '',
        listing_type: 'rent',
        price: 0,
        location: '',
        bedrooms: 1,
        furnishing: 'unfurnished',
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

  const API_URL = 'https://wakeeli-ai.up.railway.app/api'; // Hardcoded for now

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
        <p className="text-yellow-800"><strong>API URL:</strong> {API_URL}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <p className="text-red-600 text-sm mt-1">Check browser console (F12) for details.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Property Listings</h1>
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
          <h3 className="text-lg font-semibold mb-4 text-slate-800">New Property Details</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Modern Apartment in Downtown" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                value={form.listing_type} 
                onChange={e => setForm({...form, listing_type: e.target.value})}
              >
                <option value="rent">For Rent</option>
                <option value="buy">For Sale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.price} 
                onChange={e => setForm({...form, price: Number(e.target.value)})} 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="City, District"
                value={form.location} 
                onChange={e => setForm({...form, location: e.target.value})} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.bedrooms} 
                  onChange={e => setForm({...form, bedrooms: Number(e.target.value)})} 
                  required 
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Furnishing</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    value={form.furnishing} 
                    onChange={e => setForm({...form, furnishing: e.target.value})}
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="furnished">Furnished</option>
                    <option value="semi">Semi</option>
                  </select>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                rows={3}
                placeholder="Additional details..."
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
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
          {listings.map(l => (
          <div key={l.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-slate-200 relative">
              {/* Placeholder for Image */}
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Home size={48} />
              </div>
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                  l.listing_type === 'rent' ? 'bg-purple-100 text-purple-700' : 'bg-brand-100 text-brand-700'
                }`}>
                  {l.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                 <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-slate-900 shadow-sm">
                   ${l.price.toLocaleString()}
                 </span>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-slate-900 line-clamp-1">{l.title}</h3>
              </div>
              
              <div className="flex items-center text-slate-500 text-sm mb-4">
                <MapPin size={16} className="mr-1" />
                {l.location}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1">
                  <Bed size={16} />
                  <span>{l.bedrooms} Beds</span>
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
          <h3 className="text-lg font-medium text-slate-900">No properties yet</h3>
          <p className="text-slate-500">Get started by adding a new listing.</p>
        </div>
      )}
    </div>
  );
}
