"use client";
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.flyTo(center, zoom, {
        duration: 2,
      });
    }
  }, [center, zoom, map]);

  return null;
}

interface LocationData {
  lat: number;
  lon: number;
  accuracy: number;
  timestamp: number;
}

const Map = () => {
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState<string>("");

  const watchIdRef = useRef<number | null>(null);


  useEffect(() => {

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);


  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch("/api/ip");
        const data: { ip?: string; location?: { lat: number; lon: number } } =
          await res.json();


        if (data.location && !userLocation) {
          setCenter([data.location.lat, data.location.lon]);
        }
      } catch {
        setLocationError("Error fetching IP data");
      }
    };

    if (!userLocation) {
      fetchIp();
    }
  }, [userLocation]);


  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setIsTracking(true);
    setLocationError("");

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    };

    const success = (position: GeolocationPosition) => {
      const newLocation: LocationData = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now(),
      };

      setUserLocation(newLocation);
      setCenter([newLocation.lat, newLocation.lon]);
    };

    const error = (err: GeolocationPositionError) => {
      console.error("Location error:", err);
      setLocationError(`Location error: ${err.message}`);
      setIsTracking(false);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      success,
      error,
      options
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);


  const userLocationIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: "user-location-marker",
  });

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>

      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.9)",
          padding: "8px 12px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          fontSize: "12px",
        }}
      >
        {isTracking && (
          <div style={{ color: "#28a745", marginBottom: "5px" }}>
            🔄 Live tracking active...
          </div>
        )}

        {locationError && (
          <div style={{ color: "#dc3545", marginBottom: "5px" }}>
            {locationError}
          </div>
        )}

      </div>

      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        fadeAnimation={true}
      >
        <MapController center={center} zoom={15} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lon]}
            icon={userLocationIcon}
          >
            <Popup>
              <h3>📱 Live Location</h3>
              <p>🛰 Lat: {userLocation.lat.toFixed(8)}</p>
              <p>🛰 Lon: {userLocation.lon.toFixed(8)}</p>
              <p>📊 Accuracy: ±{Math.round(userLocation.accuracy)}m</p>
              <p>🕐 {new Date(userLocation.timestamp).toLocaleString()}</p>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
