import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './App.css'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Create custom icons for different negotiation states
const createCustomIcon = (color: string, symbol: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">${symbol}</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
}

const negotiatingIcon = createCustomIcon('#ff9500', '🤝') // Orange for active negotiations
const seekingDriverIcon = createCustomIcon('#ff6b35', '🔍') // Red-orange for seeking
const offeringDriverIcon = createCustomIcon('#4ecdc4', '🅿️') // Teal for offering
const userLocationIcon = createCustomIcon('#0066ff', '📍') // Blue for user

type DriverMode = 'seeking' | 'offering' | null

// AI Agent responses for negotiation
/*
const generateAIResponse = (type: 'seeker' | 'offerer', context: any) => {
  if (type === 'seeker') {
    const responses = [
      `I can wait up to 3 more minutes if needed. Currently ${context.distance || '2 blocks'} away.`,
      `Just turned the corner, should be there in exactly ${context.eta || '2 minutes'}. Is that still good?`,
      `Traffic is lighter than expected, I might be there 1 minute early. That work for you?`,
      `Running 2 minutes behind due to red light. Can you hold the spot briefly?`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  } else {
    const responses = [
      `Still loading my car, will need about ${context.delay || '3 more minutes'}. Is that OK?`,
      `Just finished loading, heading to my car now. About ${context.eta || '2 minutes'} to leave.`,
      `Car is ready, just need to warm up engine briefly. ${context.eta || '90 seconds'} max.`,
      `Actually ready now! Backing out of spot. Look for ${context.car || 'silver Toyota'}.`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
}
*/

// AI Negotiation Logic
const handleNegotiation = (seeker: any, offerer: any) => {
  const seekerETA = parseInt(seeker.arrival_time_estimate?.match(/\d+/)?.[0] || '5')
  const offererETA = parseInt(offerer.estimated_leave_time?.match(/\d+/)?.[0] || '5')
  
  if (Math.abs(seekerETA - offererETA) <= 2) {
    return {
      status: 'good_match',
      message: `Perfect timing! ${seeker.driver_name} arriving in ${seekerETA}min, ${offerer.driver_name} leaving in ${offererETA}min.`,
      aiResponse: 'This looks like an excellent match. I\'ll facilitate the coordination.'
    }
  } else if (seekerETA < offererETA) {
    return {
      status: 'seeker_early',
      message: `${seeker.driver_name} will arrive ${offererETA - seekerETA} minutes before spot is available.`,
      aiResponse: `I can ask ${seeker.driver_name} if they can wait ${offererETA - seekerETA} minutes, or find an alternative spot nearby.`
    }
  } else {
    return {
      status: 'offerer_early',
      message: `Spot will be available ${seekerETA - offererETA} minutes before ${seeker.driver_name} arrives.`,
      aiResponse: `I can hold the spot or find other interested drivers for the time gap.`
    }
  }
}

function App() {
  // Use Convex queries and mutations
  const seekingDrivers = useQuery(api.functions.getSeekingDrivers) || []
  const offeringDrivers = useQuery(api.functions.getOfferingDrivers) || []
  const createSeekingRequest = useMutation(api.functions.createSeekingRequest)
  const createOfferingRequest = useMutation(api.functions.createOfferingRequest)
  // const seedDemoData = useMutation(api.functions.seedDemoData)
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]) // Default to SF
  const [driverMode, setDriverMode] = useState<DriverMode>(null)
  const [showForm, setShowForm] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceMessage, setVoiceMessage] = useState('')
  
  // Generate random driver name
  const generateDriverName = () => {
    const names = ['Alex', 'Jordan', 'Casey', 'Sam', 'Taylor', 'Riley', 'Avery', 'Blake', 'Cameron', 'Drew']
    return names[Math.floor(Math.random() * names.length)]
  }
  
  // AI Negotiation state
  const [activeNegotiations, setActiveNegotiations] = useState<any[]>([])
  const [aiMessages, setAiMessages] = useState<string[]>([])
  
  // Suppress unused variable warnings for now
  console.log('Debug vars:', { driverMode, aiMessages })
  
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
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    }
  }, [])

  // Auto-negotiate when new drivers appear
  useEffect(() => {
    if (seekingDrivers.length > 0 && offeringDrivers.length > 0) {
      const negotiations: any[] = []
      
      seekingDrivers.forEach(seeker => {
        const compatibleOfferers = offeringDrivers.filter(offerer => {
          const seekerLocation = seeker.destination?.toLowerCase() || ''
          const offererLocation = offerer.location_description?.toLowerCase() || ''
          return seekerLocation.includes(offererLocation.split(' ')[0]) || 
                 offererLocation.includes(seekerLocation.split(' ')[0])
        })
        
        compatibleOfferers.forEach(offerer => {
          const negotiation = handleNegotiation(seeker, offerer)
          negotiations.push({
            id: `${seeker._id}-${offerer._id}`,
            seeker,
            offerer,
            ...negotiation
          })
        })
      })
      
      setActiveNegotiations(negotiations)
      
      // Generate AI commentary
      if (negotiations.length > 0) {
        const messages = negotiations.map(n => `🤖 AI: ${n.aiResponse}`)
        setAiMessages(prev => [...prev.slice(-5), ...messages].slice(-10)) // Keep last 10 messages
      }
    }
  }, [seekingDrivers, offeringDrivers])

  const handleVoiceInput = async () => {
    console.log('🎤 Voice input started')
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    
    setIsListening(true)
    console.log('🎤 Listening started...')
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log('🎤 Speech recognized:', transcript)
      setVoiceMessage(transcript)
      setIsListening(false)
      
      // Auto-submit after getting voice message
      setTimeout(() => {
        console.log('🎤 Auto-submitting message:', transcript)
        handleSubmit(transcript)
      }, 500)
    }
    
    recognition.onerror = (error: any) => {
      console.error('🎤 Speech recognition error:', error)
      setIsListening(false)
      alert(`Voice recognition error: ${error.error}. Please try again.`)
    }
    
    recognition.onend = () => {
      console.log('🎤 Speech recognition ended')
      setIsListening(false)
    }
    
    recognition.start()
    console.log('🎤 Recognition object started')
  }

  // Known locations with coordinates (SF area)
  const getLocationCoordinates = (locationName: string) => {
    const locations: {[key: string]: {lat: number, lng: number}} = {
      'dolores park': {lat: 37.7596, lng: -122.4269},
      'mission dolores park': {lat: 37.7596, lng: -122.4269},
      'golden gate park': {lat: 37.7694, lng: -122.4862},
      'union square': {lat: 37.7880, lng: -122.4075},
      'fishermans wharf': {lat: 37.8080, lng: -122.4177},
      'lombard street': {lat: 37.8021, lng: -122.4187},
      'castro': {lat: 37.7609, lng: -122.4350},
      'mission district': {lat: 37.7599, lng: -122.4148},
      'soma': {lat: 37.7749, lng: -122.4194},
      'financial district': {lat: 37.7946, lng: -122.4006},
    }
    
    const normalized = locationName.toLowerCase().trim()
    return locations[normalized] || userLocation || {lat: 37.7749, lng: -122.4194}
  }

  // AI Intent Detection - determine if user is seeking or offering parking
  const detectIntent = (message: string) => {
    const lowerMessage = message.toLowerCase()
    
    // Offering keywords (leaving, departing)
    const offeringKeywords = [
      'leaving', 'departing', 'going home', 'done', 'finished',
      'my car', 'my spot', 'available', 'free up', 'vacating'
    ]
    
    // Seeking keywords (need, looking for, going to)
    const seekingKeywords = [
      'need parking', 'looking for', 'need a spot', 'going to', 
      'heading to', 'driving to', 'need to park', 'finding parking'
    ]
    
    const offeringScore = offeringKeywords.filter(keyword => lowerMessage.includes(keyword)).length
    const seekingScore = seekingKeywords.filter(keyword => lowerMessage.includes(keyword)).length
    
    // If we find "leaving" or "I am at" patterns, it's likely offering
    if (lowerMessage.match(/(?:leaving|departing|I am at|I'm at|my car)/)) {
      return 'offering'
    }
    
    // If we find "going to" or "need" patterns, it's likely seeking  
    if (lowerMessage.match(/(?:going to|need|looking for|heading to|driving to)/)) {
      return 'seeking'
    }
    
    // Default based on scores
    return offeringScore > seekingScore ? 'offering' : 'seeking'
  }

  const handleSubmit = async (transcript?: string) => {
    const message = transcript || voiceMessage
    if (!message.trim()) {
      alert('Please provide a voice message')
      return
    }

    const driverName = generateDriverName()
    const detectedMode = detectIntent(message)
    
    console.log(`AI detected intent: ${detectedMode} for message: "${message}"`)

    try {
      if (detectedMode === 'seeking') {
        // Enhanced parsing for seeking
        const destination = message.match(/(?:to|at|near|going to|heading to|driving to) ([^,\.]+)/i)?.[1] || 'Not specified'
        const arrivalTime = message.match(/(?:in|about) (\d+[^,\.]*(?:min|minute))/i)?.[1] || '5 minutes'
        const duration = message.match(/(?:for) ([^,\.]*(?:hour|hr|min))/i)?.[1] || '2 hours'
        
        const coords = getLocationCoordinates(destination)
        
        await createSeekingRequest({
          driver_name: driverName,
          destination,
          arrival_time_estimate: arrivalTime,
          parking_duration_needed: duration,
          voice_message: message,
          requirements: '',
          lat: coords.lat,
          lng: coords.lng,
        })
        
        console.log(`✅ Created seeking request for ${driverName} going to ${destination}`)
      } else {
        // Enhanced parsing for offering - handle multiple "leaving [location]" patterns
        console.log('Processing offering message:', message)
        
        // Try multiple regex patterns to extract location
        let location = message.match(/(?:leaving|from)\s+([^,\.!?]+?)(?:\s+in\s+|\s*$)/i)?.[1]?.trim() ||
                      message.match(/(?:at|near)\s+([^,\.!?]+?)(?:\s+(?:in|for|and)\s+|\s*$)/i)?.[1]?.trim() ||
                      message.match(/(?:I\s+am\s+at|I'm\s+at)\s+([^,\.!?]+?)(?:\s+(?:in|for|and)\s+|\s*$)/i)?.[1]?.trim() ||
                      'Not specified'
        
        console.log('Extracted location:', location)
        
        const carInfo = message.match(/((?:blue|red|white|black|silver|gray|grey|green|yellow)\s+(?:toyota|honda|ford|bmw|tesla|nissan|mercedes|audi|mazda|subaru|volkswagen|volvo|hyundai|kia))/i)?.[1] || 'Not specified'
        const [carColor, carBrand] = carInfo !== 'Not specified' ? carInfo.split(' ') : ['Not specified', 'Not specified']
        const leaveTime = message.match(/(?:in|about)\s+(\d+[^,\.]*(?:min|minute))/i)?.[1] || '5 minutes'
        
        console.log('Extracted leave time:', leaveTime)
        
        const coords = getLocationCoordinates(location)
        console.log('Location coordinates:', coords)
        
        await createOfferingRequest({
          driver_name: driverName,
          location_description: location,
          car_brand: carBrand || 'Not specified',
          car_color: carColor || 'Not specified',
          estimated_leave_time: leaveTime,
          voice_message: message,
          exact_location_known: true,
          lat: coords.lat,
          lng: coords.lng,
        })
        
        console.log(`✅ Created offering request for ${driverName} leaving ${location} at coords:`, coords)
      }
      
      setShowForm(false)
      setVoiceMessage('')
      setDriverMode(null)
    } catch (error) {
      console.error('Error creating request:', error)
      alert('Error creating request. Please try again.')
    }
  }

  return (
    <div className="App">
      {/* Header */}
      <div className="header">
        <h1>Availo: Find a spot, help a neighbor</h1>
        <span className="subtitle">Your AI teammate coordinates the handoff when you say you're leaving or searching</span>
      </div>

      {/* Single universal voice button */}
      {!showForm && (
        <div className="action-buttons">
          <button 
            className="action-btn universal-btn"
            onClick={() => {
              setDriverMode(null) // Let AI determine mode from speech
              setShowForm(true)
            }}
          >
            🎤 Talk to Availo
          </button>
        </div>
      )}

      {/* Ultra-minimal voice form */}
      {showForm && (
        <div className="form-overlay">
          <div className="minimal-voice-container">
            {/* Large microphone button */}
            <button 
              onClick={handleVoiceInput}
              disabled={isListening}
              className="mega-voice-btn"
            >
              {isListening ? '🎤' : '🎤'}
            </button>
            
            {/* Concise hint below - same for both modes */}
            <p className="voice-hint">
              Say your location and timing - AI will understand the context
            </p>

            {/* Voice message display */}
            {voiceMessage && (
              <div className="voice-message-display">
                <p>"{voiceMessage}"</p>
                <small>AI processing...</small>
              </div>
            )}

            {/* Test button for debugging */}
            <button 
              onClick={async () => {
                console.log('🧪 Testing database with manual entry')
                try {
                  await createOfferingRequest({
                    driver_name: 'TestUser',
                    location_description: 'dolores park',
                    car_brand: 'toyota',
                    car_color: 'blue',
                    estimated_leave_time: '5 minutes',
                    voice_message: 'Test message - leaving Dolores Park in 5 minutes',
                    exact_location_known: true,
                    lat: 37.7596,
                    lng: -122.4269,
                  })
                  console.log('✅ Test entry created successfully!')
                  setShowForm(false)
                  setVoiceMessage('')
                  setDriverMode(null)
                } catch (error) {
                  console.error('❌ Test entry failed:', error)
                  alert(`Database test failed: ${error}`)
                }
              }}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              🧪 Test Database
            </button>

            {/* Close button */}
            <button 
              onClick={() => {
                setShowForm(false)
                setVoiceMessage('')
                setDriverMode(null)
              }} 
              className="close-btn"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

          {/* Active negotiations - priority markers */}
          {activeNegotiations.map((negotiation) => (
            <Marker 
              key={negotiation.id}
              position={[negotiation.seeker.lat || 37.7749, negotiation.seeker.lng || -122.4194]}
              icon={negotiatingIcon}
            >
              <Popup>
                <div className="negotiation-popup">
                  <h3>🤝 AI Negotiation in Progress</h3>
                  <p><strong>Seeker:</strong> {negotiation.seeker.driver_name}</p>
                  <p><strong>Offerer:</strong> {negotiation.offerer.driver_name}</p>
                  <p><strong>Status:</strong> {negotiation.status.replace('_', ' ')}</p>
                  <div className="ai-analysis">
                    <strong>AI Analysis:</strong>
                    <p>{negotiation.message}</p>
                    <em>{negotiation.aiResponse}</em>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Seeking drivers without active negotiations */}
          {seekingDrivers.filter(driver => 
            driver.lat && driver.lng && 
            !activeNegotiations.some(n => n.seeker._id === driver._id)
          ).map((driver) => (
            <Marker 
              key={driver._id}
              position={[driver.lat!, driver.lng!]}
              icon={seekingDriverIcon}
            >
              <Popup>
                <div className="driver-popup">
                  <h3>🔍 {driver.driver_name} - Waiting for AI</h3>
                  <p><strong>Destination:</strong> {driver.destination}</p>
                  <p><strong>Arriving:</strong> {driver.arrival_time_estimate}</p>
                  <p><em>AI is scanning for matches...</em></p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Offering drivers without active negotiations with circles showing time */}
          {offeringDrivers.filter(driver => 
            driver.lat && driver.lng && 
            !activeNegotiations.some(n => n.offerer._id === driver._id)
          ).flatMap((driver) => {
            // Calculate circle radius based on estimated leave time
            const timeInMinutes = parseInt(driver.estimated_leave_time?.match(/\d+/)?.[0] || '5')
            const radius = Math.max(50, Math.min(200, timeInMinutes * 20)) // 50-200 meters based on time
            
            return [
              // Circle showing time availability
              <Circle
                key={`circle-${driver._id}`}
                center={[driver.lat!, driver.lng!]}
                radius={radius}
                pathOptions={{
                  fillColor: '#4ecdc4',
                  fillOpacity: 0.2,
                  color: '#4ecdc4',
                  weight: 2,
                  opacity: 0.6
                }}
              />,
              
              // Marker for the driver
              <Marker 
                key={`marker-${driver._id}`}
                position={[driver.lat!, driver.lng!]}
                icon={offeringDriverIcon}
              >
                <Popup>
                  <div className="driver-popup">
                    <h3>🅿️ {driver.driver_name} - Spot Available</h3>
                    <p><strong>Location:</strong> {driver.location_description}</p>
                    <p><strong>Car:</strong> {driver.car_color} {driver.car_brand}</p>
                    <p><strong>Leaving:</strong> {driver.estimated_leave_time}</p>
                    <p><strong>Voice Message:</strong> "{driver.voice_message}"</p>
                    <p><em>Circle shows approximate availability area</em></p>
                  </div>
                </Popup>
              </Marker>
            ]
          })}
        </MapContainer>
      </div>

    </div>
  )
}

export default App
