import { useState, useEffect } from 'react';
import { getConversations } from '../api';

export default function Conversations() {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Conversations</h2>
      <table width="100%" border={1} cellPadding={5} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>User Phone</th>
            <th>Status</th>
            <th>Assigned Agent</th>
            <th>Requirements</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {conversations.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.user_phone}</td>
              <td>{c.status}</td>
              <td>{c.agent ? c.agent.name : '-'}</td>
              <td>
                <pre style={{ margin: 0, fontSize: '10px' }}>
                  {JSON.stringify(c.user_requirements, null, 2)}
                </pre>
              </td>
              <td>{new Date(c.updated_at || c.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
