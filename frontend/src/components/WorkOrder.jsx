import { useState } from 'react'

export default function WorkOrder({ incident, onBack }) {
  const [wo, setWo] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/work-orders/${incident.id}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to generate work order')
      const data = await res.json()
      setWo(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button className="btn" onClick={onBack} style={{ marginBottom: 16 }}>← Back to Dashboard</button>
      <h2>📋 Work Order – Incident #{incident.id}</h2>

      <div className="card">
        <h3>Incident Details</h3>
        <table>
          <tbody>
            <tr><td><strong>Issue</strong></td><td>{incident.issue_type}</td></tr>
            <tr><td><strong>Severity</strong></td><td><span className={`badge ${incident.severity}`}>{incident.severity}</span></td></tr>
            <tr><td><strong>Priority</strong></td><td>{incident.priority_score}/100</td></tr>
            <tr><td><strong>Reasons</strong></td><td>{incident.priority_reasons}</td></tr>
            {incident.lat && <tr><td><strong>Location</strong></td><td>{incident.lat}, {incident.lon}</td></tr>}
          </tbody>
        </table>
      </div>

      {!wo ? (
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : '🔧 Generate Municipal Work Order'}
        </button>
      ) : (
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3>Work Order #{wo.id}</h3>
          <table>
            <tbody>
              <tr><td><strong>Title</strong></td><td>{wo.title}</td></tr>
              <tr><td><strong>Description</strong></td><td>{wo.description}</td></tr>
              <tr><td><strong>Status</strong></td><td><span className="badge medium">{wo.status}</span></td></tr>
              <tr><td><strong>Created</strong></td><td>{new Date(wo.created_at).toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
