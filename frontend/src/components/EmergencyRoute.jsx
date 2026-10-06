import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons in bundled Leaflet
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
  const layerGroup = useRef(null)

  const [origin, setOrigin] = useState({ lat: '12.9716', lon: '77.5946' })
  const [dest, setDest] = useState({ lat: '12.9200', lon: '77.6100' })
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(false)

  // Initialize map once
  useEffect(() => {
    if (mapInstance.current) return
    mapInstance.current = L.map(mapRef.current).setView([12.95, 77.59], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance.current)
    layerGroup.current = L.layerGroup().addTo(mapInstance.current)
  }, [])

  const checkRoute = async () => {
    setLoading(true)
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
    layerGroup.current.clearLayers()
    const allPts = []

    data.segments.forEach((seg) => {
      const pts = [[seg.start_lat, seg.start_lon], [seg.end_lat, seg.end_lon]]
      allPts.push(...pts)
      L.polyline(pts, { color: HAZARD_COLORS[seg.hazard_level] || '#888', weight: 5, opacity: 0.8 })
        .bindPopup(`<b>${seg.hazard_level.toUpperCase()}</b><br/>${seg.warning}`)
        .addTo(layerGroup.current)
    })

    // Origin & destination markers
    L.marker([parseFloat(origin.lat), parseFloat(origin.lon)])
      .bindPopup('Origin').addTo(layerGroup.current)
    L.marker([parseFloat(dest.lat), parseFloat(dest.lon)])
      .bindPopup('Destination').addTo(layerGroup.current)

    if (allPts.length) mapInstance.current.fitBounds(allPts, { padding: [40, 40] })
  }

  return (
    <div>
      <h2>🚨 Emergency Route Intelligence</h2>
      <div className="disclaimer">
        ⚠️ DECISION SUPPORT ONLY – No route is guaranteed safe. Always verify conditions before traveling.
      </div>

      <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 12 }}>
        <label>
          Origin Lat
          <input type="number" step="any" value={origin.lat} onChange={(e) => setOrigin({ ...origin, lat: e.target.value })} />
        </label>
        <label>
          Origin Lon
          <input type="number" step="any" value={origin.lon} onChange={(e) => setOrigin({ ...origin, lon: e.target.value })} />
        </label>
        <label>
          Dest Lat
          <input type="number" step="any" value={dest.lat} onChange={(e) => setDest({ ...dest, lat: e.target.value })} />
        </label>
        <label>
          Dest Lon
          <input type="number" step="any" value={dest.lon} onChange={(e) => setDest({ ...dest, lon: e.target.value })} />
        </label>
        <button className="btn btn-primary" onClick={checkRoute} disabled={loading}>
          {loading ? 'Checking…' : '🔍 Check Route'}
        </button>
      </div>

      <div ref={mapRef} style={{ height: 420, borderRadius: 'var(--radius)', marginTop: 16, border: '1px solid var(--border)' }} />

      {route && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Route Analysis</h3>
          {route.high_risk_segments.length > 0 ? (
            <>
              <p style={{ color: 'var(--danger)', fontWeight: 600 }}>
                ⚠️ {route.high_risk_segments.length} high-risk segment(s) detected
              </p>
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                {route.high_risk_segments.map((s) => (
                  <li key={s.segment_id}>{s.warning}</li>
                ))}
              </ul>
            </>
          ) : (
            <p style={{ color: 'var(--success)', fontWeight: 600 }}>
              ✅ No high-risk segments detected along this route
            </p>
          )}
          <div className="disclaimer" style={{ marginTop: 12 }}>
            {route.disclaimer}
          </div>
        </div>
      )}
    </div>
  )
}
