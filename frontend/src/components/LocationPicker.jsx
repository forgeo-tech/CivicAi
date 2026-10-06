import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { readResponse } from '../api'

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
  const placeMarkerRef = useRef(null)
  const initialCenter = useRef([initialLat ?? 12.97, initialLon ?? 77.59])
  const [address, setAddress] = useState('Click the map to select a location')
  const [locationError, setLocationError] = useState('')

  useEffect(() => { placeMarkerRef.current = placeMarker })

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(initialCenter.current, 12)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(mapInstance.current)

      mapInstance.current.on('click', (e) => {
        placeMarkerRef.current(e.latlng)
      })
    }
    return () => { mapInstance.current?.remove(); mapInstance.current = null }
  }, [])

  async function placeMarker(latlng) {
    setLocationError('')
    if (marker.current) mapInstance.current.removeLayer(marker.current)
    marker.current = L.marker(latlng).addTo(mapInstance.current)
    onLocationSelect(latlng.lat, latlng.lng, 'Selected map location')

    // Reverse Geocode
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`, {
        headers: { 'Accept': 'application/json' }
      })
      const data = await readResponse(resp)
      if (data.display_name) {
        setAddress(data.display_name)
        onLocationSelect(latlng.lat, latlng.lng, data.display_name)
      }
    } catch {
      setAddress('Selected map location (name unavailable)')
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return setLocationError('Location access is not available in this browser.')
    navigator.geolocation.getCurrentPosition((pos) => {
      const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      mapInstance.current.flyTo(latlng, 15)
      placeMarker(latlng)
    }, () => setLocationError('Location permission was denied. You can still choose a point on the map.'))
  }

  return (
    <div className="map-location">
      <div className="map-toolbar">
        <div className="map-address"><strong>{address.startsWith('Click') ? 'No location selected' : 'Selected location'}</strong>{!address.startsWith('Click') && ` · ${address}`}</div>
        <button type="button" className="map-current" onClick={useCurrentLocation}>⌖ Use my location</button>
      </div>
      <div ref={mapRef} className="map-canvas" role="application" aria-label="Select incident location on map" />
      <p className="map-hint">Click anywhere on the map to place or move the incident pin.</p>
      {locationError && <p className="location-error" role="status">{locationError}</p>}
    </div>
  )
}
