import { useEffect, useState } from 'react'
import { readResponse } from '../api'

const tone = (value) => ['critical', 'high'].includes(String(value || '').toLowerCase()) ? 'high' : ['medium', 'moderate'].includes(String(value || '').toLowerCase()) ? 'medium' : 'low'

export default function Dashboard({ onSelectIncident, onReport }) {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/incidents/').then(async (res) => {
      const data = await readResponse(res)
      if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`)
      setIncidents(Array.isArray(data) ? data : [])
    }).catch((err) => {
      console.error('FixitAI incidents request failed:', err)
      setError('We couldn’t load incidents. Check the API connection and try again.')
    }).finally(() => setLoading(false))
  }, [])

  const high = incidents.filter((i) => ['high', 'critical'].includes(String(i.severity).toLowerCase())).length
  const resolved = incidents.filter((i) => ['fixed', 'resolved'].includes(String(i.status).toLowerCase())).length
  const averageConfidence = incidents.length ? Math.round(incidents.reduce((sum, i) => sum + (Number(i.confidence) || 0), 0) / incidents.length * 100) : null

  return <section className="page-stack">
    <div className="page-heading dashboard-hero">
      <div><div className="eyebrow"><span className="eyebrow-dot" /> INFRASTRUCTURE INTELLIGENCE</div><h1>Infrastructure Intelligence Dashboard</h1><p>Monitor, prioritize, and respond to infrastructure issues with AI.</p></div>
      <button className="btn btn-primary" onClick={onReport}><span aria-hidden="true">＋</span> Report an issue</button>
    </div>

    <div className="metrics-grid">
      <Metric label="Total reports" value={loading ? '—' : incidents.length} hint="All submitted incidents" icon="▤" />
      <Metric label="High priority" value={loading ? '—' : high} hint="High and critical severity" icon="↗" accent="rose" />
      <Metric label="Resolved" value={loading ? '—' : resolved} hint="Marked fixed or resolved" icon="✓" accent="green" />
      <Metric label="Avg. AI confidence" value={loading ? '—' : averageConfidence === null ? '—' : `${averageConfidence}%`} hint={averageConfidence === null ? 'Available after first report' : 'Across current reports'} icon="✳" accent="blue" />
    </div>

    <section className="panel incidents-panel">
      <div className="section-heading"><div><h2>Recent incidents</h2><p>Review AI-detected infrastructure reports</p></div><span className="count-chip">{loading ? 'Loading' : `${incidents.length} reports`}</span></div>
      {loading ? <div className="skeleton-list" aria-label="Loading incidents"><div /><div /><div /></div>
        : error ? <div className="inline-error"><strong>Something went wrong</strong><span>{error}</span></div>
          : incidents.length === 0 ? <div className="empty-state"><div className="empty-icon">⌁</div><h3>No incidents yet</h3><p>Upload an infrastructure image to create your first AI-powered report.</p><button className="btn btn-primary" onClick={onReport}>Report an issue</button></div>
            : <div className="table-wrap"><table className="incident-table"><thead><tr><th>Incident</th><th>Severity</th><th>Priority</th><th>Confidence</th><th>Status</th><th>Reported</th><th /></tr></thead><tbody>
              {incidents.map((inc) => <tr key={inc.id}>
                <td><div className="incident-name"><div className="incident-thumb" aria-hidden="true"><span>⌁</span></div><div><strong>{inc.issue_type || 'Infrastructure issue'}</strong><small>#{inc.id}{inc.location_name ? ` · ${inc.location_name}` : ''}</small></div></div></td>
                <td><span className={`badge severity-${tone(inc.severity)}`}>{inc.severity || 'Unknown'}</span></td>
                <td><div className="priority-cell"><div className="priority-bar"><div className={`priority-bar-fill severity-fill-${tone(inc.severity)}`} style={{ width: `${Math.max(0, Math.min(100, Number(inc.priority_score) || 0))}%` }} /></div><strong>{Number(inc.priority_score) || 0}</strong></div></td>
                <td>{Number.isFinite(Number(inc.confidence)) ? `${Math.round(Number(inc.confidence) * 100)}%` : '—'}</td>
                <td><span className={`status-chip status-${String(inc.status || '').toLowerCase()}`}>{(inc.status || 'unknown').replaceAll('_', ' ')}</span></td>
                <td className="date-cell">{inc.created_at ? new Date(inc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                <td><button className="text-button" onClick={() => onSelectIncident(inc)}>View details <span aria-hidden="true">→</span></button></td>
              </tr>)}
            </tbody></table></div>}
    </section>
    <div className="data-note"><span>ⓘ</span> Insights reflect reports currently available from your FixitAI backend.</div>
  </section>
}

function Metric({ label, value, hint, icon, accent = '' }) {
  return <article className="metric-card"><div className={`metric-icon ${accent}`}>{icon}</div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-hint">{hint}</div></article>
}
