import { useState, useEffect } from 'react';
import { getListings, createListing, deleteListing } from '../api';

export default function Listings() {
  const [listings, setListings] = useState<any[]>([]);
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
      const res = await getListings();
      setListings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
      loadListings();
    } catch (err) {
      console.error(err);
      alert('Error creating listing');
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
    <div>
      <h2>Listings</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h3>Add New Listing</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <select value={form.listing_type} onChange={e => setForm({...form, listing_type: e.target.value})}>
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
          </select>
          <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} required />
          <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
          <input type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: Number(e.target.value)})} required />
          <select value={form.furnishing} onChange={e => setForm({...form, furnishing: e.target.value})}>
            <option value="unfurnished">Unfurnished</option>
            <option value="furnished">Furnished</option>
            <option value="semi">Semi-Furnished</option>
          </select>
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ gridColumn: 'span 2' }} />
          <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: 'blue', color: 'white' }}>Add Listing</button>
        </form>
      </div>

      <table width="100%" border={1} cellPadding={5} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Location</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.title}</td>
              <td>{l.listing_type}</td>
              <td>{l.location}</td>
              <td>${l.price}</td>
              <td>
                <button onClick={() => handleDelete(l.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
