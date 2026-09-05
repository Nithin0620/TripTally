"use client";

import { useEffect, useRef, useState } from "react";
import { INDIA_CENTER, MAPBOX_STYLE } from "@/lib/mapbox";
import { Activity } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface TripActivityMapProps {
  activities: Activity[];
  className?: string;
}

interface Marker {
  id: string;
  title: string;
  location?: string;
  coordinates: [number, number];
}

export default function TripActivityMap({
  activities,
  className = "",
}: TripActivityMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapError, setMapError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const validActivities = activities.filter(
    (a) => a.latitude != null && a.longitude != null
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = async () => {
      const mapboxModule: any = await import("mapbox-gl");
      const mapboxgl = mapboxModule.default || mapboxModule;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token || !token.startsWith("pk.")) {
        setMapError("Mapbox token not configured");
        setLoading(false);
        return;
      }

      mapboxgl.accessToken = token;

      const center =
        validActivities.length > 0
          ? [validActivities[0].longitude!, validActivities[0].latitude!]
          : INDIA_CENTER;

      const zoom = validActivities.length > 1 ? 10 : 13;

      let map: any;
      try {
        map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: MAPBOX_STYLE,
          center,
          zoom,
          attributionControl: false,
        });
      } catch {
        setMapError("Failed to initialize map");
        setLoading(false);
        return;
      }

      mapRef.current = map;
      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }),
        "top-right"
      );

      map.on("load", () => {
        setLoading(false);
        addActivityMarkers(map, mapboxgl);
      });

      return () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapRef.current = null;
      };
    };

    void initMap();
  }, []);

  useEffect(() => {
    if (mapRef.current && !loading) {
      const mapboxgl = (window as any).__mapboxgl;
      if (mapboxgl) {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        addActivityMarkers(mapRef.current, mapboxgl);
      }
    }
  }, [validActivities]);

  const addActivityMarkers = (map: any, mapboxgl: any) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    validActivities.forEach((activity, idx) => {
      const el = document.createElement("div");
      el.className = "trip-activity-marker";
      el.innerHTML = `
        <div style="
          width: 32px; height: 32px;
          background: #3B82F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 13px;
          box-shadow: 0 2px 8px rgba(59,130,246,0.4);
          border: 2px solid white;
          cursor: pointer;
        ">${idx + 1}</div>
      `;

      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        offset: 20,
      }).setHTML(`
        <div style="padding: 8px 12px; font-family: system-ui, sans-serif; max-width: 220px;">
          <p style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0; color: #0F172A;">
            ${activity.title}
          </p>
          ${activity.location ? `<p style="font-size: 12px; color: #64748B; margin: 0;">📍 ${activity.location}</p>` : ""}
          ${activity.notes ? `<p style="font-size: 11px; color: #94A3B8; margin: 4px 0 0 0; line-height: 1.4;">${activity.notes.slice(0, 100)}${activity.notes.length > 100 ? "..." : ""}</p>` : ""}
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([activity.longitude!, activity.latitude!])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    if (validActivities.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      validActivities.forEach((a) => {
        bounds.extend([a.longitude!, a.latitude!]);
      });
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }
  };

  if (mapError) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-white/40 bg-white/30 p-6 text-center text-sm text-[#64748B] ${className}`}>
        <div>
          <p className="text-3xl mb-2">🗺️</p>
          <p>{mapError}</p>
          {validActivities.length === 0 && (
            <p className="text-xs text-[#94A3B8] mt-1">
              Add activities with coordinates to see them on the map
            </p>
          )}
        </div>
      </div>
    );
  }

  if (validActivities.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-white/40 bg-white/30 p-6 text-center text-sm text-[#64748B] ${className}`}>
        <div>
          <p className="text-3xl mb-2">📍</p>
          <p>No activities with coordinates</p>
          <p className="text-xs text-[#94A3B8] mt-1">
            Add location data to activities to see them on the map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 rounded-2xl">
          <LoadingSpinner text="Loading map..." />
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-2xl border border-white/40"
      />
    </div>
  );
}
