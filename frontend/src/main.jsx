import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';
const NEXT_STATUS = { OPEN: 'IN_PROGRESS', IN_PROGRESS: 'RESOLVED', RESOLVED: 'OPEN' };
const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];
const json = { 'Content-Type': 'application/json' };

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, urgent: 0 });
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const [a, b] = await Promise.all([fetch(`${API}/tickets`), fetch(`${API}/tickets/stats`)]);
      if (!a.ok || !b.ok) throw Error('Backend unavailable');
      setTickets(await a.json());
      setStats(await b.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const visible = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);

  const advance = async (t) => {
    await fetch(`${API}/tickets/${t.id}`, { method: 'PUT', headers: json, body: JSON.stringify({ status: NEXT_STATUS[t.status] }) });
    load();
  };
  const remove = async (t) => {
    await fetch(`${API}/tickets/${t.id}`, { method: 'DELETE' });
    load();
  };
  const create = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    await fetch(`${API}/tickets`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({
        subject: f.get('subject'),
        description: f.get('description'),
        category: f.get('category'),
        priority: f.get('priority'),
        requester: f.get('requester'),
        status: 'OPEN',
      }),
    });
    form.reset();
    setShowForm(false);
    load();
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">H</span><div><b>HelpDesk</b><small>Support Console</small></div></div>
        <nav>
          <a className="active">▦ <span>Dashboard</span></a>
          <a>✉ <span>All Tickets</span></a>
          <a>★ <span>Urgent</span></a>
          <a>◌ <span>Activity</span></a>
        </nav>
        <div className="side-bottom">
          <div className="upgrade"><strong>Resolve faster.</strong><p>Track, assign and close customer issues in one place.</p></div>
          <div className="profile"><div className="avatar">TM</div><div><b>Tanmay</b><small>Support Agent</small></div><span>⋮</span></div>
        </div>
      </aside>
      <main className="main">
        <header>
          <div>
            <p className="eyebrow">SUPPORT / OVERVIEW</p>
            <h1>Support dashboard 🎧</h1>
            <p className="muted">{stats.urgent} urgent ticket(s) need attention right now.</p>
          </div>
          <button className="primary" onClick={() => setShowForm(true)}>＋ New ticket</button>
        </header>
        {error && <div className="alert">⚠ {error}. Start the backend and PostgreSQL, then refresh.</div>}
        <section className="stats">
          <Stat label="Total tickets" value={stats.total} icon="▦" />
          <Stat label="Open" value={stats.open} icon="○" />
          <Stat label="In progress" value={stats.inProgress} icon="◔" />
          <Stat label="Resolved" value={stats.resolved} icon="✓" />
        </section>
        <section className="content-grid">
          <div className="panel tasks-panel">
            <div className="panel-head">
              <div><h2>Tickets</h2><p className="muted">Customer issues across all categories.</p></div>
              <div className="filters">
                {FILTERS.map((x) => (
                  <button className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)} key={x}>
                    {x === 'ALL' ? 'All' : x.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            {loading ? <div className="empty">Loading tickets…</div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Ticket</th><th>Requester</th><th>Category</th><th>Priority</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {visible.map((t) => (
                      <tr key={t.id}>
                        <td><div className="task-title"><span className={`dot ${t.status.toLowerCase()}`}></span><div><b>#{t.id} {t.subject}</b><small>{t.description}</small></div></div></td>
                        <td>{t.requester}</td>
                        <td><span className="category">{t.category}</span></td>
                        <td><span className={`priority ${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                        <td><span className={`status ${t.status.toLowerCase()}`}>{t.status.replace('_', ' ')}</span></td>
                        <td><div className="row-actions">
                          <button className="icon-btn" onClick={() => advance(t)} title="Advance status">↻</button>
                          <button className="icon-btn danger" onClick={() => remove(t)} title="Delete ticket">🗑</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visible.length && <div className="empty">No tickets in this filter.</div>}
              </div>
            )}
          </div>
          <aside className="panel activity">
            <div className="panel-head"><div><h2>Recent activity</h2><p className="muted">Latest support events.</p></div></div>
            <Activity icon="✓" text="Billing ticket resolved" time="12 min ago" />
            <Activity icon="◔" text="Login issue assigned to an agent" time="38 min ago" />
            <Activity icon="＋" text="New technical ticket opened" time="1 hr ago" />
            <Activity icon="↗" text="Deployment pipeline passed" time="2 hrs ago" />
            <div className="pipeline"><span>CI</span><i></i><span>Build</span><i></i><span>Scan</span><i></i><span>Deploy</span></div>
          </aside>
        </section>
        {showForm && (
          <div className="modal-backdrop">
            <form className="modal" onSubmit={create}>
              <div className="modal-head">
                <div><p className="eyebrow">CREATE TICKET</p><h2>Open a new ticket</h2></div>
                <button type="button" className="close" onClick={() => setShowForm(false)}>×</button>
              </div>
              <label>Subject<input name="subject" required placeholder="e.g. Cannot reset my password" /></label>
              <label>Description<textarea name="description" placeholder="Describe the issue" /></label>
              <div className="form-row">
                <label>Category<select name="category"><option>GENERAL</option><option>BILLING</option><option>TECHNICAL</option><option>ACCOUNT</option></select></label>
                <label>Priority<select name="priority" defaultValue="MEDIUM"><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option></select></label>
              </div>
              <label>Requester<input name="requester" defaultValue="Customer" /></label>
              <button className="primary full">Create ticket</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return <div className="stat"><div className="stat-icon">{icon}</div><div><small>{label}</small><strong>{value}</strong><span>Updated just now</span></div></div>;
}
function Activity({ icon, text, time }) {
  return <div className="activity-row"><span className="activity-icon">{icon}</span><div><b>{text}</b><small>{time}</small></div></div>;
}

createRoot(document.getElementById('root')).render(<App />);
