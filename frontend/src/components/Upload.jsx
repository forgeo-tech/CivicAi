import { useState } from 'react'
import LocationPicker from './LocationPicker'
import { readResponse } from '../api'

export default function Upload({ onCreated }) {
  const [file, setFile] = useState(null)
  const [location, setLocation] = useState({ lat: null, lon: null, name: null })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!file || location.lat == null || location.lon == null) return
    setLoading(true); setError(''); setResult(null)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('lat', location.lat)
    formData.append('lon', location.lon)
    if (location.name) formData.append('location_name', location.name)
    try {
      const res = await fetch('/api/incidents/upload', { method: 'POST', body: formData })
      const data = await readResponse(res)
      if (!res.ok) throw new Error(data.detail || `Upload failed (${res.status})`)
      setResult(data)
    } catch (err) {
      console.error('FixitAI upload failed:', err)
      setError(err.message || 'FixitAI couldn’t complete this request. Please try again.')
    } finally { setLoading(false) }
  }

  const analysis = result?.results
  return <section className="page-stack">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> NEW REPORT</div><h1>Report an issue</h1><p>Share an infrastructure concern. AI will analyze the image and help prioritize a response.</p></div></div>
    <div className="workflow-steps"><div className="workflow-step complete"><span>1</span><div><strong>Add image</strong><small>Show the issue</small></div></div><i /><div className={`workflow-step ${file ? 'complete' : 'current'}`}><span>2</span><div><strong>Select location</strong><small>Pin it on the map</small></div></div><i /><div className={`workflow-step ${analysis ? 'complete' : ''}`}><span>3</span><div><strong>AI analysis</strong><small>Review and submit</small></div></div></div>
    <form onSubmit={handleSubmit} className="report-layout">
      <div className="report-main">
        <section className="panel form-panel"><div className="section-heading"><div><h2>Infrastructure image</h2><p>Upload a clear photo of the issue for analysis.</p></div><span className="step-tag">STEP 01</span></div>
          <label className={`upload-dropzone ${file ? 'has-file' : ''}`} htmlFor="issue-image"><input id="issue-image" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {file ? <><div className="upload-symbol">✓</div><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB · Click to replace</span></> : <><div className="upload-symbol">↑</div><strong>Choose an image to upload</strong><span>JPG, PNG or WEBP · Select a photo from your device</span><em>Browse files</em></>}
          </label>
          {file && <div className="selected-file"><span className="file-icon">▧</span><span><strong>{file.name}</strong><small>Ready for AI analysis</small></span><button type="button" className="text-button" onClick={() => setFile(null)}>Remove</button></div>}
        </section>
        <section className="panel form-panel"><div className="section-heading"><div><h2>Issue location</h2><p>Click the map to place a pin at the incident.</p></div><span className="step-tag">STEP 02</span></div>
          <LocationPicker onLocationSelect={(lat, lon, name) => setLocation({ lat, lon, name })} />
        </section>
      </div>
      <aside className="report-aside"><section className="panel review-panel"><div className="section-heading"><div><h2>Review report</h2><p>Confirm details before analysis.</p></div></div>
        <div className="review-row"><span className="review-icon">▧</span><div><strong>Image</strong><small>{file ? file.name : 'No image selected'}</small></div><span className={file ? 'review-check done' : 'review-check'}>{file ? '✓' : '·'}</span></div>
        <div className="review-row"><span className="review-icon">⌖</span><div><strong>Location</strong><small>{location.name || 'Select a point on the map'}</small></div><span className={location.lat != null ? 'review-check done' : 'review-check'}>{location.lat != null ? '✓' : '·'}</span></div>
        {error && <div className="form-error"><strong>Something went wrong</strong><span>{error}</span></div>}
        <button className="btn btn-primary submit-report" type="submit" disabled={!file || location.lat == null || loading}>{loading ? <><span className="spinner" /> Analyzing infrastructure…</> : 'Analyze and submit report'} <span aria-hidden="true">→</span></button>
        <p className="privacy-note">Your report is sent to the FixitAI analysis service.</p>
      </section>
      {loading && <div className="analyzing-card"><span className="pulse-mark">✳</span><div><strong>Analyzing infrastructure…</strong><p>Reviewing image for reported issues</p></div></div>}
      {analysis && <section className="panel result-panel"><div className="result-kicker"><span className="result-spark">✳</span> AI DETECTION</div><h2>{analysis.issue_type}</h2><p className="confidence-text">{Number.isFinite(Number(analysis.confidence)) ? `${(Number(analysis.confidence) * 100).toFixed(1)}% confidence` : 'Confidence unavailable'}</p><div className="result-divider" /><div className="result-facts"><div><span>Severity</span><b className={`badge severity-${String(analysis.severity).toLowerCase()}`}>{analysis.severity}</b></div><div><span>Priority</span><strong className="result-priority">{analysis.priority_score}<small> / 100</small></strong></div></div><div className="priority-bar result-bar"><div className={`priority-bar-fill severity-fill-${String(analysis.severity).toLowerCase()}`} style={{ width: `${Math.min(100, Number(analysis.priority_score) || 0)}%` }} /></div>{analysis.priority_reasons?.length > 0 && <div className="reason-block"><h3>Why this priority?</h3><ul>{analysis.priority_reasons.map((reason, i) => <li key={i}>{reason}</li>)}</ul></div>}<div className="saved-message"><span>✓</span> Incident #{result.incident_id} saved to database.</div><button type="button" className="btn btn-primary submit-report" onClick={onCreated}>View dashboard <span>→</span></button></section>}
      </aside>
    </form>
  </section>
}
