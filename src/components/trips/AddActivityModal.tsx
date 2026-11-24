"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { activitiesApi } from "@/lib/api/activities";
import { Activity, Place } from "@/types";
import { modalBackdrop, modalContent } from "@/lib/animations";
import { buildActivityNotes } from "@/utils/activity";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  FileText,
  X,
  Compass,
  Utensils,
  Camera,
  Palmtree,
  Car,
  Search,
  Crosshair,
  Loader2
} from "lucide-react";

interface AddActivityModalProps {
  tripId: string;
  defaultDate?: string;
  startDate?: string;
  endDate?: string;
  destination?: string;
  onClose: () => void;
  onSuccess: (newActivity: Activity) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

const CATEGORIES = [
  { id: "Sightseeing", icon: Camera, color: "text-blue-600 bg-blue-50" },
  { id: "Food & Dining", icon: Utensils, color: "text-amber-600 bg-amber-50" },
  { id: "Adventure", icon: Compass, color: "text-emerald-600 bg-emerald-50" },
  { id: "Relaxation", icon: Palmtree, color: "text-purple-600 bg-purple-50" },
  { id: "Transport", icon: Car, color: "text-slate-600 bg-slate-50" },
];

const PLACE_CATEGORIES = ["Beaches", "Mountains", "Cities", "Spiritual", "Luxury"] as const;

export default function AddActivityModal({
  tripId,
  defaultDate,
  startDate,
  endDate,
  destination,
  onClose,
  onSuccess,
  showToast,
}: AddActivityModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate || startDate || new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [category, setCategory] = useState("Sightseeing");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getMapboxToken = () => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !token.startsWith("pk.")) {
      showToast("Set a public Mapbox token (pk.*) to use location search", "error");
      return null;
    }
    return token;
  };

  const geocodeAddress = async (query: string) => {
    if (!query.trim()) {
      showToast("Enter a location to find its coordinates", "info");
      return false;
    }

    const token = getMapboxToken();
    if (!token) return false;

    setGeocoding(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?limit=1&access_token=${token}`
      );
      if (!response.ok) throw new Error("Geocoding failed");

      const data = (await response.json()) as {
        features?: Array<{ center?: [number, number]; place_name?: string }>;
      };
      const feature = data.features?.[0];
      if (!feature?.center) {
        showToast("No coordinates found for that location", "info");
        return false;
      }

      setLatitude(feature.center[1].toFixed(6));
      setLongitude(feature.center[0].toFixed(6));
      if (feature.place_name && !location.trim()) setLocation(feature.place_name);
      return true;
    } catch {
      showToast("Failed to find coordinates for that location", "error");
      return false;
    } finally {
      setGeocoding(false);
    }
  };

  const handleGeocode = async () => {
    const found = await geocodeAddress(location);
    if (found) showToast("Coordinates added from location", "success");
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not available in this browser", "error");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (token?.startsWith("pk.") && !location.trim()) {
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json?limit=1&access_token=${token}`
            );
            if (response.ok) {
              const data = (await response.json()) as {
                features?: Array<{ place_name?: string }>;
              };
              if (data.features?.[0]?.place_name) setLocation(data.features[0].place_name);
            }
          } catch {
            setLocation("");
          }
        }

        setLocating(false);
        showToast("Coordinates added from your current location", "success");
      },
      () => {
        setLocating(false);
        showToast("Location permission denied or unavailable", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFindNearby = async () => {
    const query = location.trim() || destination?.trim() || "";
    setSuggestionsLoading(true);
    setShowSuggestions(true);

    try {
      const results = await Promise.all(
        PLACE_CATEGORIES.map(async (category) => {
          const response = await fetch(
            `/api/explore/places?category=${encodeURIComponent(category)}&limit=12`
          );
          if (!response.ok) return [] as Place[];
          const data = (await response.json()) as { success?: boolean; data?: Place[] };
          return data.success ? data.data || [] : [];
        })
      );

      const allPlaces = results.flat();
      const normalized = query.toLowerCase();
      const matches = normalized
        ? allPlaces.filter((place) =>
            `${place.name} ${place.state} ${place.description}`.toLowerCase().includes(normalized)
          )
        : allPlaces;

      const nextSuggestions = matches.slice(0, 6);
      setSuggestions(nextSuggestions);
      if (!nextSuggestions.length) showToast("No nearby places found", "info");
    } catch {
      showToast("Failed to load place suggestions", "error");
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSelectPlace = async (place: Place) => {
    const label = [place.name, place.state].filter(Boolean).join(", ");
    setTitle(place.name);
    setLocation(label);
    setShowSuggestions(false);

    const found = await geocodeAddress(label);
    if (found) showToast("Place added with map coordinates", "success");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("Activity title is required", "error");
      return;
    }
    if (!date) {
      showToast("Activity date is required", "error");
      return;
    }
    if (Boolean(latitude.trim()) !== Boolean(longitude.trim())) {
      showToast("Enter both latitude and longitude, or leave both blank", "error");
      return;
    }
    if (latitude.trim() && Number.isNaN(Number(latitude))) {
      showToast("Latitude must be a number", "error");
      return;
    }
    if (longitude.trim() && Number.isNaN(Number(longitude))) {
      showToast("Longitude must be a number", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await activitiesApi.createActivity({
        trip_id: tripId,
        title: title.trim(),
        activity_date: date,
        location: location.trim() || undefined,
        latitude: latitude.trim() ? parseFloat(latitude) : undefined,
        longitude: longitude.trim() ? parseFloat(longitude) : undefined,
        notes: buildActivityNotes({ timeSlot, category, notes }),
      });

      if (response.error) {
        showToast(response.error, "error");
      } else if (response.data?.activity) {
        showToast("Activity added to itinerary!", "success");
        onSuccess(response.data.activity);
        onClose();
      }
    } catch {
      showToast("Failed to create activity", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={modalBackdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add Itinerary Activity</h2>
              <p className="text-xs text-slate-500">Plan a place, meal, or event for your trip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Activity Title *
            </label>
            <NeuInput
              type="text"
              placeholder="e.g. Scuba Diving at Grand Island"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Date & Time Slot Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                value={date}
                min={startDate}
                max={endDate}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Time Slot (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM – 1:00 PM"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>Location / Address</span>
            </label>
            <NeuInput
              type="text"
              placeholder="e.g. Candolim, North Goa"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocoding || !location.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
              >
                {geocoding ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Search className="h-3 w-3" />
                )}
                <span>{geocoding ? "Finding..." : "Find coordinates"}</span>
              </button>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
              >
                {locating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Crosshair className="h-3 w-3" />
                )}
                <span>{locating ? "Locating..." : "Use my location"}</span>
              </button>
              <button
                type="button"
                onClick={handleFindNearby}
                disabled={suggestionsLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                {suggestionsLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Compass className="h-3 w-3" />
                )}
                <span>{suggestionsLoading ? "Searching..." : "Nearby places"}</span>
              </button>
            </div>
            {showSuggestions && (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {suggestionsLoading ? (
                  <p className="px-3 py-2 text-[11px] text-slate-500">Searching places...</p>
                ) : suggestions.length ? (
                  suggestions.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-blue-50/60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-slate-800">
                          {place.name}
                        </span>
                        <span className="block truncate text-[10px] text-slate-500">
                          {place.state} · {place.category}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] font-bold text-blue-600">Use</span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-[11px] text-slate-500">No matching places found.</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Latitude (Optional)
              </label>
              <NeuInput
                type="number"
                step="any"
                placeholder="e.g. 15.2993"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Longitude (Optional)
              </label>
              <NeuInput
                type="number"
                step="any"
                placeholder="e.g. 74.1240"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              <span>Category</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{cat.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Notes & Tips</span>
            </label>
            <textarea
              placeholder="Add details, tickets booking links, dress codes, or packing notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Adding Activity..." : "Add to Itinerary"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
