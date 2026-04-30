"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
// Dynamically import mapbox-gl inside effect to avoid including it in every page bundle
// (mapbox-gl is large and should be client-only).
import { INDIA_CENTER, MAPBOX_STYLE } from "@/lib/mapbox";

type FamousPlace = {
  name: string;
  description: string;
  coordinates: [number, number];
};

export default function MapBoxMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = async () => {
      const mapboxModule: any = await import('mapbox-gl');
      const mapboxgl = mapboxModule.default || mapboxModule;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      console.log("MapBox Token:", token); // Debug log

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
        setMapError("Failed to initialize Mapbox. Verify NEXT_PUBLIC_MAPBOX_TOKEN is a valid public token (pk.*).");
        return;
      }

      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), "top-right");
      map.addControl(new mapboxgl.FullscreenControl(), "top-right");

      let markers: any[] = [];
      let activePopup: any = null;

      const addMarkers = async () => {
        const response = await fetch("/api/explore/famous-places", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { places?: FamousPlace[] };
        const places = (data.places || []).filter((place) => 
          place && place.name && place.description && place.coordinates && place.coordinates.length === 2
        );

        markers = places.map((place) => {
          const markerElement = document.createElement("div");
          markerElement.className = "triptally-map-marker cursor-pointer";

          // Create popup content
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
            const slug = place.name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-");
            router.push(`/explore/${slug}`);
          });

          const closeButton = document.createElement("button");
          closeButton.type = "button";
          closeButton.className = "triptally-map-popup-close";
          closeButton.textContent = "✕";
          closeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            popup.remove();
            isPinned = false;
          });

          popupContent.appendChild(closeButton);
          popupContent.appendChild(title);
          popupContent.appendChild(description);
          popupContent.appendChild(button);

          const popup = new mapboxgl.Popup({ 
            closeButton: false, 
            closeOnClick: false,
            offset: 30,
            anchor: 'top'
          }).setDOMContent(popupContent);

          const marker = new mapboxgl.Marker({ element: markerElement, anchor: "center" })
            .setLngLat(place.coordinates)
            .addTo(map);

          let hoverTimeout: NodeJS.Timeout | null = null;
          let isPinned = false;

          // Show popup on hover
          markerElement.addEventListener("mouseenter", () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            popup.setLngLat(place.coordinates).addTo(map);
          });

          // Hide popup when leaving marker (only if not pinned)
          markerElement.addEventListener("mouseleave", () => {
            hoverTimeout = setTimeout(() => {
              if (!isPinned) {
                popup.remove();
              }
            }, 100);
          });

          // Pin popup on marker click
          markerElement.addEventListener("click", () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            isPinned = true;
            popup.setLngLat(place.coordinates).addTo(map);
          });

          // Keep popup visible when hovering over it
          popup.getElement()?.addEventListener("mouseenter", () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
          });

          popup.getElement()?.addEventListener("mouseleave", () => {
            hoverTimeout = setTimeout(() => {
              if (!isPinned) {
                popup.remove();
              }
            }, 100);
          });

          return marker;
        });
      };

      // Wait for map to load before adding markers
      map.on('load', () => {
        void addMarkers();
      });

      return () => {
        markers.forEach((marker) => marker.remove());
        map.remove();
        mapRef.current = null;
      };
    };

    void initMap();
  }, []);

  if (mapError) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-3xl border border-[#cfe0d7] bg-white p-6 text-center text-sm text-[#4f6f5e]">
        {mapError}
      </div>
    );
  }

  return <div ref={mapContainerRef} className="h-full w-full rounded-3xl border border-[#cfe0d7]" />;
}
