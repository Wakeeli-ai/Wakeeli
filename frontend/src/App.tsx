import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Listings from './pages/Listings';
import Agents from './pages/Agents';
import Conversations from './pages/Conversations';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh' }}>
        <nav style={{ width: '200px', padding: '20px', background: '#f0f0f0', borderRight: '1px solid #ccc' }}>
          <h2>Wakeeli Admin</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}><Link to="/listings">Listings</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/agents">Agents</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/conversations">Conversations</Link></li>
          </ul>
        </nav>
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <Routes>
            <Route path="/listings" element={<Listings />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/" element={<div><h3>Welcome to Wakeeli Admin</h3><p>Select a tab to manage resources.</p></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
