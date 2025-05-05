"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  TrafficLayer,
  BicyclingLayer,
  TransitLayer,
  Circle,
} from "@react-google-maps/api"

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.375rem",
}

const defaultCenter = {
  lat: 40.7128, // New York City coordinates as default
  lng: -74.006,
}

const libraries = ["places", "drawing", "geometry", "visualization"]

// Map styling for a cleaner look
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

export function MapComponent({ plots, selectedPlotId, onSelectPlot, userLocation }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const [map, setMap] = useState(null)
  const [activeMarker, setActiveMarker] = useState(null)
  const [mapLayers, setMapLayers] = useState({
    traffic: false,
    transit: false,
    bicycling: false,
  })
  const mapRef = useRef(null)

  const onLoad = useCallback(
    (map) => {
      mapRef.current = map
      setMap(map)

      // If we have user location, center the map there
      if (userLocation) {
        map.setCenter(userLocation)
        map.setZoom(14)
      }
      // If we have plots, fit the map to their bounds
      else if (plots && plots.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        plots.forEach((plot) => {
          if (plot.lat && plot.lng) {
            bounds.extend({ lat: plot.lat, lng: plot.lng })
          }
        })
        map.fitBounds(bounds)

        // If there's only one plot, zoom out a bit
        if (plots.length === 1) {
          map.setZoom(15)
        }
      }
    },
    [plots, userLocation],
  )

  // This effect will update the map when plots or user location changes
  useEffect(() => {
    if (!map) return

    if (userLocation) {
      map.setCenter(userLocation)
      map.setZoom(14)
    } else if (plots && plots.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      let validPlots = 0

      plots.forEach((plot) => {
        if (plot.lat && plot.lng) {
          bounds.extend({ lat: plot.lat, lng: plot.lng })
          validPlots++
        }
      })

      if (validPlots > 0) {
        map.fitBounds(bounds)

        // If there's only one plot, zoom out a bit
        if (validPlots === 1) {
          map.setZoom(15)
        }
      }
    }
  }, [plots, userLocation, map])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleMarkerClick = (plotId) => {
    onSelectPlot(plotId)
    setActiveMarker(plotId)
  }

  // Update map when selectedPlotId changes
  useEffect(() => {
    if (map && selectedPlotId) {
      const selectedPlot = plots.find((plot) => plot.id === selectedPlotId)
      if (selectedPlot && selectedPlot.lat && selectedPlot.lng) {
        map.panTo({ lat: selectedPlot.lat, lng: selectedPlot.lng })
        map.setZoom(16)
      }
    }
  }, [selectedPlotId, map, plots])

  // Toggle map layers
  const toggleLayer = (layerName) => {
    setMapLayers((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }))
  }

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
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || defaultCenter}
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
        {/* Map Layers */}
        {mapLayers.traffic && <TrafficLayer />}
        {mapLayers.transit && <TransitLayer />}
        {mapLayers.bicycling && <BicyclingLayer />}

        {/* User Location */}
        {userLocation && (
          <>
            <Marker
              position={userLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
            <Circle
              center={userLocation}
              radius={1000}
              options={{
                fillColor: "#4285F4",
                fillOpacity: 0.1,
                strokeColor: "#4285F4",
                strokeOpacity: 0.3,
                strokeWeight: 1,
              }}
            />
          </>
        )}

        {/* Plot Markers */}
        {plots &&
          plots.length > 0 &&
          plots.map((plot) => {
            if (!plot.lat || !plot.lng) return null
            return (
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
            )
          })}
      </GoogleMap>

      {/* Layer Controls */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded-md shadow-md z-10">
        <div className="flex flex-col space-y-2">
          <button
            className={`px-2 py-1 text-xs rounded ${mapLayers.traffic ? "bg-primary text-white" : "bg-gray-200"}`}
            onClick={() => toggleLayer("traffic")}
          >
            Traffic
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${mapLayers.transit ? "bg-primary text-white" : "bg-gray-200"}`}
            onClick={() => toggleLayer("transit")}
          >
            Transit
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${mapLayers.bicycling ? "bg-primary text-white" : "bg-gray-200"}`}
            onClick={() => toggleLayer("bicycling")}
          >
            Bicycling
          </button>
        </div>
      </div>
    </div>
  )
}
