import { useState } from 'react'
import { readResponse } from '../api'

const reasons = (value) => Array.isArray(value) ? value : String(value || '').split(';').map((part) => part.trim()).filter(Boolean)

export default function WorkOrder({ incident: initialIncident, onBack }) {
  const [incident, setIncident] = useState(initialIncident)
  const [wo, setWo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const updateStatus = async (status) => {
    setUpdating(true); setError('')
    try {
      const res = await fetch(`/api/incidents/${incident.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const data = await readResponse(res)
      if (!res.ok) throw new Error(data.detail || 'Could not update incident status.')
      setIncident(data)
    } catch (err) { console.error('FixitAI status update failed:', err); setError(err.message) }
    finally { setUpdating(false) }
  }

  const generate = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/work-orders/${incident.id}`, { method: 'POST' })
      const data = await readResponse(res)
      if (!res.ok) throw new Error(data.detail || 'Could not generate a work order.')
      setWo(data)
    } catch (err) { console.error('FixitAI work order request failed:', err); setError(err.message) }
    finally { setLoading(false) }
  }

  const severity = String(incident.severity || '').toLowerCase()
  const priority = Math.min(100, Math.max(0, Number(incident.priority_score) || 0))
  return <section className="page-stack">
    <button className="text-button" onClick={onBack}>← Back to dashboard</button>
    <div className="page-heading"><div><div className="eyebrow">INCIDENT #{incident.id}</div><h1>{incident.issue_type || 'Infrastructure issue'}</h1><p>{incident.location_name || (incident.lat != null ? `${incident.lat}, ${incident.lon}` : 'Location not provided')}</p></div><div className="detail-actions"><span className={`badge severity-${severity || 'unknown'}`}>{incident.severity || 'Unknown'} severity</span></div></div>
    {error && <div className="form-error"><strong>Something went wrong</strong><span>{error}</span></div>}
    <div className="report-layout">
      <div className="report-main">
        <section className="panel form-panel"><div className="section-heading"><div><h2>Incident overview</h2><p>AI assessment and report information</p></div></div><div className="detail-metrics"><div><span>AI confidence</span><strong>{Number.isFinite(Number(incident.confidence)) ? `${Math.round(Number(incident.confidence) * 100)}%` : '—'}</strong></div><div><span>Priority score</span><strong className="priority-detail">{priority}<small> / 100</small></strong></div><div><span>Reported</span><strong>{incident.created_at ? new Date(incident.created_at).toLocaleString() : '—'}</strong></div></div><div style={{padding:'0 20px 20px'}}><div className="priority-bar" style={{width:'100%',height:8}}><div className={`priority-bar-fill severity-fill-${severity}`} style={{width:`${priority}%`}} /></div><h3 style={{font:'700 12px Manrope',margin:'19px 0 9px'}}>Why this priority?</h3><div className="detail-reasons">{reasons(incident.priority_reasons).length ? reasons(incident.priority_reasons).map((reason,i)=><span className="reason-pill" key={i}>{reason}</span>) : <span className="map-hint">No priority reasons returned for this incident.</span>}</div></div></section>
        {wo && <section className="panel route-card"><div className="section-heading" style={{padding:'0 0 13px'}}><div><h2>Work order #{wo.id}</h2><p>{wo.title}</p></div><span className="status-chip">{String(wo.status).replaceAll('_',' ')}</span></div><p style={{fontSize:12,color:'#66736c',margin:0}}>{wo.description}</p><small style={{display:'block',color:'#99a49e',marginTop:10,fontSize:10}}>Created {wo.created_at ? new Date(wo.created_at).toLocaleString() : '—'}</small></section>}
      </div>
      <aside className="report-aside"><section className="panel review-panel"><div className="section-heading"><div><h2>Manage incident</h2><p>Current status and actions</p></div></div><div className="review-row"><span className="review-icon">◉</span><div><strong>Report status</strong><small>Update the incident lifecycle</small></div></div><div style={{padding:'0 16px'}}><label htmlFor="incident-status" style={{fontSize:10,color:'#728078'}}>Status</label><select id="incident-status" value={incident.status || 'reported'} disabled={updating} onChange={(e)=>updateStatus(e.target.value)} style={{display:'block',width:'100%',marginTop:5,padding:'9px 10px',border:'1px solid #e3eae6',borderRadius:8,background:'#fff',color:'#34443b',fontSize:11}}><option value="reported">Reported</option><option value="verified">Verified</option><option value="ignored">Ignored</option><option value="fixed">Fixed</option></select></div><button className="btn btn-primary submit-report" onClick={generate} disabled={loading}>{loading ? <><span className="spinner"/> Creating work order…</> : wo ? 'Create another work order' : 'Generate work order'} <span>→</span></button></section></aside>
    </div>
  </section>
}
