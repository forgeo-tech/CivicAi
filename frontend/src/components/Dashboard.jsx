import { useEffect, useState } from 'react'

export default function Dashboard({ onSelectIncident }) {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/incidents/')
      .then((r) => r.json())
      .then(setIncidents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading…</p>

  return (
    <div>
      <h2>📊 Incident Dashboard</h2>
      <div className="demo-banner">
        ⚠️ DEMO MODE – Data shown is from synthetic AI analysis, not real predictions.
      </div>

      {incidents.length === 0 ? (
        <div className="card">No incidents yet. Upload an image first.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Issue</th>
              <th>Severity</th>
              <th>Priority</th>
              <th>Confidence</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc) => (
              <tr key={inc.id}>
                <td>#{inc.id}</td>
                <td><span className={`badge ${inc.status === 'verified' ? 'low' : inc.status === 'reported' ? 'medium' : 'none'}`}>{inc.status}</span></td>
                <td>{inc.issue_type}</td>
                <td><span className={`badge ${inc.severity}`}>{inc.severity}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="priority-bar" style={{ width: 80 }}>
                      <div
                        className="priority-bar-fill"
                        style={{
                          width: `${inc.priority_score}%`,
                          background: inc.priority_score >= 70 ? 'var(--danger)' : inc.priority_score >= 30 ? 'var(--warning)' : 'var(--success)',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.85rem' }}>{inc.priority_score}</span>
                  </div>
                </td>
                <td>{(inc.confidence * 100).toFixed(0)}%</td>
                <td style={{ fontSize: '0.85rem' }}>{new Date(inc.created_at).toLocaleString()}</td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => onSelectIncident(inc)}>
                    Work Order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
