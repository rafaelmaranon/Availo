import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './App.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface ParkingSpot {
  id: string
  location_text: string
  lat: number
  lng: number
  leaving_time: string
  notes?: string
  created_at: number
}

// Create custom icons for different marker types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

const availableSpotIcon = createCustomIcon('#00ff00') // Green for available spots
const userLocationIcon = createCustomIcon('#0066ff') // Blue for user location

function App() {
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]) // Default to SF

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          setMapCenter([latitude, longitude])
        },
        (error) => {
          console.log('Geolocation error:', error)
          // Keep default SF location if geolocation fails
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    }
  }, [])

  // Auto-seed demo data on component mount
  useEffect(() => {
    seedDemoData()
  }, [])

  const seedDemoData = () => {
    const now = new Date()
    // Set default time to next hour
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000)
    
    const demoSpots: ParkingSpot[] = [
      {
        id: '1',
        location_text: "Mission & 16th Street",
        lat: 37.7649,
        lng: -122.4194,
        leaving_time: new Date(nextHour.getTime() + 5 * 60 * 1000).toISOString(),
        notes: "Blue Honda Civic, near the coffee shop",
        created_at: Date.now(),
      },
      {
        id: '2',
        location_text: "Dolores Park entrance",
        lat: 37.7596,
        lng: -122.4269,
        leaving_time: new Date(nextHour.getTime() + 15 * 60 * 1000).toISOString(),
        notes: "White Toyota Prius, by the playground",
        created_at: Date.now(),
      },
      {
        id: '3',
        location_text: "Valencia & 24th",
        lat: 37.7524,
        lng: -122.4211,
        leaving_time: new Date(nextHour.getTime() + 25 * 60 * 1000).toISOString(),
        notes: "Red Tesla Model 3",
        created_at: Date.now(),
      },
      {
        id: '4',
        location_text: "Castro & Market",
        lat: 37.7609,
        lng: -122.4350,
        leaving_time: new Date(nextHour.getTime() + 35 * 60 * 1000).toISOString(),
        notes: "Black BMW, corner spot",
        created_at: Date.now(),
      },
      {
        id: '5',
        location_text: "Lombard Street",
        lat: 37.8019,
        lng: -122.4187,
        leaving_time: new Date(nextHour.getTime() + 45 * 60 * 1000).toISOString(),
        notes: "Silver Subaru, near tourist area",
        created_at: Date.now(),
      },
    ]
    
    setSpots(demoSpots)
  }

  const formatTimeUntilAvailable = (leavingTime: string) => {
    const now = new Date().getTime()
    const leaving = new Date(leavingTime).getTime()
    const minutesUntil = Math.round((leaving - now) / (1000 * 60))
    
    if (minutesUntil < 0) return "Available now"
    if (minutesUntil < 60) return `Available in ${minutesUntil}m`
    
    const hours = Math.floor(minutesUntil / 60)
    const minutes = minutesUntil % 60
    return `Available in ${hours}h ${minutes}m`
  }

  return (
    <div className="App">
      {/* Header with minimal branding */}
      <div className="header">
        <h1>🚗 Availo</h1>
        <span className="spot-count">{spots.length} spots available</span>
      </div>

      {/* Full-screen map */}
      <div className="map-container">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* User location marker */}
          {userLocation && (
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <div>
                  <strong>📍 Your Location</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Available parking spots */}
          {spots.map((spot) => (
            <Marker 
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={availableSpotIcon}
            >
              <Popup>
                <div className="spot-popup">
                  <h3>🅿️ {spot.location_text}</h3>
                  <p><strong>⏰ {formatTimeUntilAvailable(spot.leaving_time)}</strong></p>
                  <p><em>{spot.notes}</em></p>
                  <button 
                    onClick={() => {
                      const mapsUrl = `https://maps.google.com/?q=${spot.lat},${spot.lng}`
                      window.open(mapsUrl, '_blank')
                    }}
                    className="navigate-btn"
                  >
                    🧭 Navigate Here
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Floating refresh button */}
      <button 
        className="refresh-btn"
        onClick={() => {
          seedDemoData()
          // Re-get user location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords
                setUserLocation({ lat: latitude, lng: longitude })
              }
            )
          }
        }}
      >
        🔄 Refresh
      </button>
    </div>
  )
}

export default App
