"use client" // Enables client-side rendering in Next.js

// Importing required hooks and components
import { useState, useCallback, useRef, useEffect } from "react"
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  TrafficLayer,
  BicyclingLayer,
  TransitLayer,
} from "@react-google-maps/api"

// Style for the map container
const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.375rem", // Rounded corners
}

// Google Maps libraries needed
const libraries = ["places", "drawing", "geometry", "visualization"]

// Optional map styling (removes business POIs and tweaks transit icons)
const mapStyles = [
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "on" }],
  },
]

// Main Map component
export function MapComponent({ plots, selectedPlotId, onSelectPlot }) {
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  // React states
  const [map, setMap] = useState(null) // Reference to the map instance
  const [activeMarker, setActiveMarker] = useState(null) // Currently open InfoWindow
  const [mapLayers, setMapLayers] = useState({
    traffic: false,
    transit: false,
    bicycling: false,
  })
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  
  // Default map center (New York City)
  const defaultCenter = {
  lat: latitude,
  lng: longitude,
}

  const mapRef = useRef(null) // Ref to access the map outside of React state

  // Function to run when map loads
  const onLoad = useCallback(
    (map) => {
      mapRef.current = map
      setMap(map)

      // Adjust the map bounds to fit all plots
      if (plots && plots.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        plots.forEach((plot) => {
          bounds.extend({ lat: plot.lat, lng: plot.lng })
        })
        map.fitBounds(bounds)

        // Zoom in slightly if only one plot
        if (plots.length === 1) {
          map.setZoom(15)
        }
      }
    },
    [plots],
  )

  // Cleanup when map unmounts
  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])
  
  useEffect(()=>{
    console.log(latitude, longitude)
  },[latitude, longitude])

  // When a marker is clicked
  const handleMarkerClick = (plotId) => {
    onSelectPlot(plotId) // Trigger parent handler
    setActiveMarker(plotId) // Open the InfoWindow
  }

  // Center and zoom to the selected plot when selectedPlotId changes
  useEffect(() => {
    if (map && selectedPlotId) {
      const selectedPlot = plots.find((plot) => plot.id === selectedPlotId)
      if (selectedPlot) {
        map.panTo({ lat: selectedPlot.lat, lng: selectedPlot.lng })
        map.setZoom(16)
      }
    }
  }, [selectedPlotId, map, plots])


    useEffect(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude)
            setLongitude(position.coords.longitude)
          },
          (error) => {
            console.error("Geolocation error:", error)
            toast({
              variant: "destructive",
              title: "Location Error",
              description: "We couldn't get your location automatically.",
            })
          }
        )
      } else {
        toast({
          variant: "destructive",
          title: "Unsupported",
          description: "Geolocation is not supported by your browser.",
        })
      }
    }, [])
    

  // Toggle individual map layers (traffic, transit, bicycling)
  const toggleLayer = (layerName) => {
    setMapLayers((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }))
  }

  // Error handling if map fails to load
  if (loadError) {
    return (
      <div className="h-full w-full bg-muted flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-lg font-medium mb-2 text-red-500">Error loading Google Maps</p>
          <p className="text-sm text-muted-foreground">
            There was an error loading Google Maps. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  // Show loading state while Google Maps is loading
  if (!isLoaded) {
    return (
      <div className="h-full w-full bg-muted flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-lg font-medium mb-2">Loading Google Maps...</p>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {/* Render the Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          zoomControl: true,
          mapTypeControlOptions: {
            position: window.google.maps.ControlPosition.TOP_RIGHT,
          },
          styles: mapStyles,
        }}
      >
        {/* Render optional layers */}
        {mapLayers.traffic && <TrafficLayer />}
        {mapLayers.transit && <TransitLayer />}
        {mapLayers.bicycling && <BicyclingLayer />}

        {/* Render all plot markers */}
        {plots.map((plot) => (
          <Marker
            key={plot.id}
            position={{ lat: plot.lat, lng: plot.lng }} 
            onClick={() => handleMarkerClick(plot.id)}
            animation={window.google.maps.Animation.DROP}
            icon={{
              url: selectedPlotId === plot.id ? "/marker-selected.svg" : "/marker-default.svg",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          >
            {/* Show InfoWindow if this marker is active */}
            {activeMarker === plot.id && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div className="p-2">
                  <h3 className="font-medium text-sm">{plot.name}</h3>
                  <p className="text-xs text-gray-600">${plot.price}/hour</p>
                  <p className="text-xs text-gray-600">
                    {plot.availableSlots}/{plot.totalSlots} spots available
                  </p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>

      {/* Buttons to toggle map layers */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded-md shadow-md z-10">
        <div className="flex flex-col space-y-2">
          <button
            className={`px-2 py-1 text-xs rounded ${
              mapLayers.traffic ? "bg-primary text-white" : "bg-gray-200"
            }`}
            onClick={() => toggleLayer("traffic")}
          >
            Traffic
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              mapLayers.transit ? "bg-primary text-white" : "bg-gray-200"
            }`}
            onClick={() => toggleLayer("transit")}
          >
            Transit
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              mapLayers.bicycling ? "bg-primary text-white" : "bg-gray-200"
            }`}
            onClick={() => toggleLayer("bicycling")}
          >
            Bicycling
          </button>
        </div>
      </div>
    </div>
  )
}
