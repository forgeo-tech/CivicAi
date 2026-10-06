import { useState } from 'react'

export default function WorkOrder({ incident: initialIncident, onBack }) {
  const [incident, setIncident] = useState(initialIncident)
  const [wo, setWo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  const updateStatus = async (newStatus) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/incidents/${incident.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Status update failed')
      const data = await res.json()
      setIncident(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(false)
    }
  }

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
            <tr>
              <td><strong>Status</strong></td>
              <td>
                <select
                  value={incident.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating}
                  style={{ padding: '4px', borderRadius: '4px' }}
                >
                  <option value="reported">Reported</option>
                  <option value="verified">Verified</option>
                  <option value="ignored">Ignored</option>
                  <option value="fixed">Fixed</option>
                </select>
              </td>
            </tr>
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
