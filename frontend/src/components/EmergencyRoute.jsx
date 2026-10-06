import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import LocationPicker from './LocationPicker'
import { readResponse } from '../api'

const COLORS = { high: '#d87969', medium: '#d2a344', low: '#45a37a', none: '#9eaaa3' }

export default function EmergencyRoute() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const layerGroup = useRef(null)
  const [origin, setOrigin] = useState({ lat: null, lon: null, name: '' })
  const [dest, setDest] = useState({ lat: null, lon: null, name: '' })
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => { mapInstance.current?.remove(); mapInstance.current = null }, [])

  const checkRoute = async () => {
    if (origin.lat == null || dest.lat == null) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/routes/emergency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origin_lat: Number(origin.lat), origin_lon: Number(origin.lon), dest_lat: Number(dest.lat), dest_lon: Number(dest.lon) }) })
      const data = await readResponse(res)
      if (!res.ok) throw new Error(data.detail || `Route calculation failed (${res.status})`)
      setRoute(data)
    } catch (err) { console.error('FixitAI route calculation failed:', err); setError(err.message || 'Could not calculate route.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!route || !mapRef.current) return
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([Number(origin.lat), Number(origin.lon)], 12)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(mapInstance.current)
      layerGroup.current = L.layerGroup().addTo(mapInstance.current)
    }
    layerGroup.current.clearLayers()
    route.segments?.forEach((seg) => L.polyline([[seg.start_lat, seg.start_lon], [seg.end_lat, seg.end_lon]], { color: COLORS[seg.hazard_level] || COLORS.none, weight: 6, opacity: .9 }).bindPopup(seg.warning || `Hazard level: ${seg.hazard_level}`).addTo(layerGroup.current))
    const points = (route.segments || []).flatMap((seg) => [[seg.start_lat, seg.start_lon], [seg.end_lat, seg.end_lon]])
    if (points.length) mapInstance.current.fitBounds(points, { padding: [30, 30] })
    setTimeout(() => mapInstance.current?.invalidateSize(), 80)
  }, [route, origin.lat, origin.lon])

  const updatePoint = (setter) => (lat, lon, name) => setter({ lat, lon, name })
  const highCount = route?.high_risk_segments?.length || 0
  return <section className="page-stack">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> ROUTE PLANNING</div><h1>Emergency Route Intelligence</h1><p>Review reported infrastructure hazards along a route.</p></div></div>
    <div className="disclaimer">Decision support only. Route analysis reflects reported infrastructure issues and does not guarantee road conditions or route safety.</div>
    <div className="panel route-card"><div className="section-heading" style={{padding:'0 0 16px'}}><div><h2>Origin → Destination</h2><p>Select both points on the map to calculate route risk.</p></div></div><div className="route-points"><div><label className="route-label">ORIGIN</label><LocationPicker onLocationSelect={updatePoint(setOrigin)}/></div><div><label className="route-label">DESTINATION</label><LocationPicker onLocationSelect={updatePoint(setDest)}/></div></div><button className="btn btn-primary" onClick={checkRoute} disabled={loading || origin.lat == null || dest.lat == null}>{loading ? <><span className="spinner"/> Calculating route…</> : 'Calculate route risk →'}</button></div>
    {error && <div className="form-error" style={{margin:0}}><strong>Could not calculate route</strong><span>{error}</span></div>}
    {route && <section className="panel route-card"><div className="section-heading" style={{padding:'0 0 14px'}}><div><h2>Route risk overview</h2><p>Known hazard levels across {route.segments?.length || 0} route segments.</p></div><span className={`badge ${highCount ? 'severity-high' : 'severity-low'}`}>{highCount ? `${highCount} high risk` : 'No high risk reported'}</span></div><div ref={mapRef} className="route-map" aria-label="Calculated route hazard map" />{highCount ? <div className="route-alert">Known hazard detected on this route. Review the highlighted segments and verify current conditions.</div> : <div className="route-alert safe">No high-risk segments were returned from current incident data. This is not a safety guarantee.</div>}<div className="hazard-list">{route.segments?.map((seg)=><article className="hazard-row" key={seg.segment_id}><span className="hazard-dot" style={{background:COLORS[seg.hazard_level] || COLORS.none}}/><div><strong>Segment {seg.segment_id}</strong><p>{seg.warning || 'No warning details available.'}</p></div><span className={`badge severity-${seg.hazard_level === 'high' ? 'high' : seg.hazard_level === 'medium' ? 'medium' : 'low'}`}>{seg.hazard_level}</span></article>)}</div>{route.alternative_available && <p className="map-hint">An alternative route is available according to the route service.</p>}</section>}
  </section>
}
