import { useState } from 'react'
import LocationPicker from './LocationPicker'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [location, setLocation] = useState({ lat: null, lon: null, name: null })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('image', file)
    if (location.lat) formData.append('lat', location.lat)
    if (location.lon) formData.append('lon', location.lon)
    if (location.name) formData.append('location_name', location.name)

    try {
      const res = await fetch('/api/incidents/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>📷 Upload Infrastructure Image</h2>
      <div className="demo-banner">
        ⚠️ DEMO MODE – AI results are synthetic and for demonstration purposes only.
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          <strong>Image</strong>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'block', marginTop: 4 }} />
        </label>

        <label><strong>Location</strong> (Click to report)</label>
        <LocationPicker onLocationSelect={(lat, lon, name) => setLocation({ lat, lon, name })}/>

        <button className="btn btn-primary" type="submit" disabled={!file || !location.lat || loading}>
          {loading ? 'Analyzing…' : 'Upload & Submit'}
        </button>
      </form>

      {error && <div className="card" style={{ color: 'var(--danger)' }}>❌ {error}</div>}

      {result && (
        <div className="card">
          <h3>Analysis Result</h3>
          <table>
            <tbody>
              <tr><td><strong>Issue Type</strong></td><td>{result.results.issue_type}</td></tr>
              <tr><td><strong>Confidence</strong></td><td>{(result.results.confidence * 100).toFixed(1)}%</td></tr>
              <tr><td><strong>Severity</strong></td><td><span className={`badge ${result.results.severity}`}>{result.results.severity}</span></td></tr>
              <tr>
                <td><strong>Priority</strong></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="priority-bar" style={{ width: 120 }}>
                      <div
                        className="priority-bar-fill"
                        style={{
                          width: `${result.results.priority_score}%`,
                          background: result.results.priority_score >= 70 ? 'var(--danger)' : result.results.priority_score >= 30 ? 'var(--warning)' : 'var(--success)',
                        }}
                      />
                    </div>
                    {result.results.priority_score}/100
                  </div>
                </td>
              </tr>
              <tr>
                <td><strong>Reasons</strong></td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {result.results.priority_reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Incident #{result.incident_id} saved to database.
          </p>
        </div>
      )}
    </div>
  )
}
