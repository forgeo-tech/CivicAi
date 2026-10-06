import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function LocationPicker({ onLocationSelect, initialLat, initialLon }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const marker = useRef(null)
  const [address, setAddress] = useState('Click map to select location')

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([12.97, 77.59], 12)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current)

      mapInstance.current.on('click', (e) => {
        placeMarker(e.latlng)
      })
    }
  }, [])

  const placeMarker = async (latlng) => {
    if (marker.current) mapInstance.current.removeLayer(marker.current)
    marker.current = L.marker(latlng).addTo(mapInstance.current)
    onLocationSelect(latlng.lat, latlng.lng, 'Selected map location')

    // Reverse Geocode
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'CivicAI-Hackathon' }
      })
      const data = await resp.json()
      if (data.display_name) {
        setAddress(data.display_name)
        onLocationSelect(latlng.lat, latlng.lng, data.display_name)
      }
    } catch (e) {
      setAddress('Selected map location (name unavailable)')
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported')
    navigator.geolocation.getCurrentPosition((pos) => {
      const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      mapInstance.current.flyTo(latlng, 15)
      placeMarker(latlng)
    }, () => alert('Location permission denied'))
  }

  return (
    <div>
      <div style={{ marginBottom: 10, display: 'flex', gap: 10 }}>
        <button type="button" className="btn btn-sm" onClick={useCurrentLocation}>Use current location</button>
        <strong>Selected: {address}</strong>
      </div>
      <div ref={mapRef} style={{ height: 300, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
    </div>
  )
}
