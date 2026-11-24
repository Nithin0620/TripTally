"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity } from "@/types";
import { INDIA_CENTER, MAPBOX_STYLE } from "@/lib/mapbox";
import { parseActivityNotes } from "@/utils/activity";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface TripActivityMapProps {
  activities: Activity[];
  className?: string;
}

export default function TripActivityMap({
  activities,
  className = "h-[400px] w-full",
}: TripActivityMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const mapboxglRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapError, setMapError] = useState("");
  const [loading, setLoading] = useState(true);

  const validActivities = useMemo(
    () =>
      activities.filter(
        (activity) =>
          typeof activity.latitude === "number" &&
          typeof activity.longitude === "number" &&
          Number.isFinite(activity.latitude) &&
          Number.isFinite(activity.longitude)
      ),
    [activities]
  );

  const hasActivities = validActivities.length > 0;

  useEffect(() => {
    if (!hasActivities || !mapContainerRef.current) return;

    let disposed = false;

    const initMap = async () => {
      const mapboxModule: any = await import("mapbox-gl");
      const mapboxgl = mapboxModule.default || mapboxModule;
      if (disposed) return;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        setMapError("Missing NEXT_PUBLIC_MAPBOX_TOKEN in environment variables.");
        setLoading(false);
        return;
      }
      if (!token.startsWith("pk.")) {
        setMapError(
          "Invalid Mapbox token: use a public token (pk.*) in NEXT_PUBLIC_MAPBOX_TOKEN."
        );
        setLoading(false);
        return;
      }

      mapboxgl.accessToken = token;
      mapboxglRef.current = mapboxgl;

      let map: any;
      try {
        map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: MAPBOX_STYLE,
          center: INDIA_CENTER,
          zoom: 4,
          attributionControl: false,
        });
      } catch {
        setMapError("Failed to initialize Mapbox. Verify your public token and try again.");
        setLoading(false);
        return;
      }

      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
      map.addControl(new mapboxgl.FullscreenControl(), "top-right");
      map.on("load", () => {
        if (!disposed) setLoading(false);
      });
    };

    void initMap();

    return () => {
      disposed = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      mapboxglRef.current = null;
    };
  }, [hasActivities]);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxglRef.current;
    if (!map || !mapboxgl || loading || mapError) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = validActivities.map((activity) => {
      const markerElement = document.createElement("div");
      markerElement.className = "triptally-map-marker cursor-pointer";
      markerElement.style.width = "28px";
      markerElement.style.height = "28px";
      markerElement.style.borderRadius = "9999px";
      markerElement.style.background = "#2563eb";
      markerElement.style.border = "3px solid #ffffff";
      markerElement.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.45)";

      const popupContent = document.createElement("div");
      popupContent.className = "triptally-map-popup";
      popupContent.style.padding = "8px 10px";
      popupContent.style.maxWidth = "240px";

      const title = document.createElement("h3");
      title.className = "triptally-map-popup-title";
      title.style.margin = "0 0 4px";
      title.style.fontSize = "13px";
      title.style.fontWeight = "700";
      title.style.color = "#0f172a";
      title.textContent = activity.title;
      popupContent.appendChild(title);

      const parsed = parseActivityNotes(activity.notes);
      const metaText = [parsed.timeSlot, activity.location].filter(Boolean).join(" · ");
      if (metaText) {
        const meta = document.createElement("p");
        meta.className = "triptally-map-popup-description";
        meta.style.margin = "0";
        meta.style.fontSize = "11px";
        meta.style.color = "#64748b";
        meta.textContent = metaText;
        popupContent.appendChild(meta);
      }

      if (parsed.description) {
        const description = document.createElement("p");
        description.className = "triptally-map-popup-description";
        description.style.margin = "6px 0 0";
        description.style.fontSize = "11px";
        description.style.color = "#475569";
        description.style.whiteSpace = "pre-line";
        description.textContent = parsed.description;
        popupContent.appendChild(description);
      }

      const popup = new mapboxgl.Popup({
        offset: 24,
        closeButton: false,
        closeOnClick: false,
      }).setDOMContent(popupContent);

      return new mapboxgl.Marker({ element: markerElement, anchor: "bottom" })
        .setLngLat([activity.longitude!, activity.latitude!])
        .setPopup(popup)
        .addTo(map);
    });

    if (validActivities.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      validActivities.forEach((activity) => {
        bounds.extend([activity.longitude!, activity.latitude!]);
      });
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    } else if (validActivities.length === 1) {
      map.flyTo({
        center: [validActivities[0].longitude!, validActivities[0].latitude!],
        zoom: 12,
      });
    }
  }, [validActivities, loading, mapError]);

  if (mapError) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-white/40 bg-white/30 p-6 text-center text-sm text-[#64748B] ${className}`}
      >
        <div>
          <p className="text-3xl mb-2">🗺️</p>
          <p>{mapError}</p>
        </div>
      </div>
    );
  }

  if (!hasActivities) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-white/40 bg-white/30 p-6 text-center text-sm text-[#64748B] ${className}`}
      >
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
