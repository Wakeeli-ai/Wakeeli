import { useState, useEffect } from 'react';
import { getAgents, createAgent, deleteAgent } from '../api';

export default function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    territories: '',
    specialties: 'rent',
    priority: 1
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const res = await getAgents();
      setAgents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        territories: form.territories.split(',').map(s => s.trim()),
        specialties: [form.specialties] // Simplification for MVP
      };
      await createAgent(payload);
      setForm({
        name: '',
        phone: '',
        email: '',
        territories: '',
        specialties: 'rent',
        priority: 1
      });
      loadAgents();
    } catch (err) {
      console.error(err);
      alert('Error creating agent');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteAgent(id);
      loadAgents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Agents</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h3>Add New Agent</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
          <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input placeholder="Territories (comma sep)" value={form.territories} onChange={e => setForm({...form, territories: e.target.value})} required />
          <select value={form.specialties} onChange={e => setForm({...form, specialties: e.target.value})}>
            <option value="rent">Rent Only</option>
            <option value="buy">Buy Only</option>
          </select>
          <input type="number" placeholder="Priority" value={form.priority} onChange={e => setForm({...form, priority: Number(e.target.value)})} required />
          <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: 'green', color: 'white' }}>Add Agent</button>
        </form>
      </div>

      <table width="100%" border={1} cellPadding={5} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Territories</th>
            <th>Specialties</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.name}</td>
              <td>{a.phone}</td>
              <td>{a.territories?.join(', ')}</td>
              <td>{a.specialties?.join(', ')}</td>
              <td>{a.priority}</td>
              <td>
                <button onClick={() => handleDelete(a.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
