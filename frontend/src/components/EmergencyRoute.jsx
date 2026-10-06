import { useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import LocationPicker from './LocationPicker'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const HAZARD_COLORS = { high: '#ef4444', medium: '#f59e0b', none: '#10b981' }

export default function EmergencyRoute() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  const [origin, setOrigin] = useState({ lat: null, lon: null })
  const [dest, setDest] = useState({ lat: null, lon: null })
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkRoute = async () => {
    if (!origin.lat || !dest.lat) return alert('Select both locations')
    setLoading(true)

    // Map view setup
    if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([12.95, 77.59], 12)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current)
    }

    try {
      const res = await fetch('/api/routes/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_lat: parseFloat(origin.lat),
          origin_lon: parseFloat(origin.lon),
          dest_lat: parseFloat(dest.lat),
          dest_lon: parseFloat(dest.lon),
        }),
      })
      if (!res.ok) throw new Error('Route check failed')
      const data = await res.json()
      setRoute(data)
      drawRoute(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const drawRoute = (data) => {
    // Basic route rendering
    data.segments.forEach((seg) => {
      L.polyline([[seg.start_lat, seg.start_lon], [seg.end_lat, seg.end_lon]], {
        color: HAZARD_COLORS[seg.hazard_level] || '#888', weight: 5
      }).addTo(mapInstance.current)
    })
    mapInstance.current.fitBounds([[origin.lat, origin.lon], [dest.lat, dest.lon]], { padding: [40, 40] })
  }

  return (
    <div>
      <h2>🚨 Emergency Route Intelligence</h2>
      <div className="disclaimer">⚠️ DECISION SUPPORT ONLY...</div>

      <div className="card" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <label><strong>Select Origin</strong></label>
          <LocationPicker onLocationSelect={(lat, lon) => setOrigin({ lat, lon })} />
        </div>
        <div style={{ flex: 1 }}>
          <label><strong>Select Destination</strong></label>
          <LocationPicker onLocationSelect={(lat, lon) => setDest({ lat, lon })} />
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={checkRoute} disabled={loading || !origin.lat || !dest.lat}>
        {loading ? 'Checking…' : '🔍 Check Route'}
      </button>

      <div ref={mapRef} style={{ height: 420, borderRadius: 'var(--radius)', marginTop: 16, border: '1px solid var(--border)' }} />

      {route && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Route Analysis</h3>
          {route.high_risk_segments.length > 0 ? (
            <p style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠️ {route.high_risk_segments.length} high-risk segments</p>
          ) : (
            <p style={{ color: 'var(--success)', fontWeight: 600 }}>✅ No high-risk segments</p>
          )}
        </div>
      )}
    </div>
  )
}
