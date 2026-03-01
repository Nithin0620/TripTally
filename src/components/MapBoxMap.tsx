"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { INDIA_CENTER, MAPBOX_STYLE } from "@/lib/mapbox";
import { placeNameToSlug } from "@/lib/explore";

type FamousPlace = {
  name: string;
  description: string;
  coordinates: [number, number];
};

export default function MapBoxMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string>("");

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
      setMapError("Missing NEXT_PUBLIC_MAPBOX_TOKEN in environment variables.");
      return;
    }

    if (!token.startsWith("pk.")) {
      setMapError(
        "Invalid Mapbox token: use a public token (pk.*) in NEXT_PUBLIC_MAPBOX_TOKEN, not a secret token (sk.*)."
      );
      return;
    }

    mapboxgl.accessToken = token;

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: MAPBOX_STYLE,
        center: INDIA_CENTER,
        zoom: 4,
        attributionControl: false,
      });
    } catch {
      setMapError("Failed to initialize Mapbox. Verify NEXT_PUBLIC_MAPBOX_TOKEN is a valid public token (pk.*).");
      return;
    }

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    let markers: mapboxgl.Marker[] = [];

    const addMarkers = async () => {
      const response = await fetch("/api/explore/famous-places", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { places?: FamousPlace[] };
      const places = data.places || [];

      markers = places.map((place) => {
        const markerElement = document.createElement("div");
        markerElement.className = "triptally-map-marker";

        const popupContent = document.createElement("div");
        popupContent.className = "triptally-map-popup";

        const title = document.createElement("h3");
        title.className = "triptally-map-popup-title";
        title.textContent = place.name;

        const description = document.createElement("p");
        description.className = "triptally-map-popup-description";
        description.textContent = place.description;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "triptally-map-popup-button";
        button.textContent = "Explore";
        button.addEventListener("click", () => {
          window.location.href = `/explore/${placeNameToSlug(place.name)}`;
        });

        popupContent.appendChild(title);
        popupContent.appendChild(description);
        popupContent.appendChild(button);

        const popup = new mapboxgl.Popup({ closeButton: false, offset: 14 }).setDOMContent(popupContent);

        return new mapboxgl.Marker({ element: markerElement, anchor: "center" })
          .setLngLat(place.coordinates)
          .setPopup(popup)
          .addTo(map);
      });
    };

    void addMarkers();

    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  if (mapError) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-3xl border border-white/10 bg-[#17394B]/40 p-6 text-center text-sm text-white/80">
        {mapError}
      </div>
    );
  }

  return <div ref={mapContainerRef} className="h-full w-full rounded-3xl border border-white/10" />;
}
