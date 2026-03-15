import { createApi } from "unsplash-js";

export type UnsplashImage = {
  imageUrl: string;
  imageThumbUrl: string;
  imageAlt: string;
  photographerName: string;
  photographerProfile: string;
};

function getUnsplashClient() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return null;
  }

  return createApi({
    accessKey,
  });
}

export async function getUnsplashImageForPlace(placeName: string): Promise<UnsplashImage | null> {
  const unsplash = getUnsplashClient();
  if (!unsplash) {
    return null;
  }

  const query = `${placeName} India travel landscape`;

  const response = await unsplash.search.getPhotos({
    query,
    page: 1,
    perPage: 1,
    orientation: "landscape",
    contentFilter: "high",
  });

  if (response.type === "error") {
    return null;
  }

  const firstPhoto = response.response.results[0];
  if (!firstPhoto) {
    return null;
  }

  return {
    imageUrl: firstPhoto.urls.regular,
    imageThumbUrl: firstPhoto.urls.small,
    imageAlt: firstPhoto.alt_description || `${placeName} travel image`,
    photographerName: firstPhoto.user.name,
    photographerProfile: firstPhoto.user.links.html,
  };
}

/**
 * Fetch multiple high-quality images for a place
 * Used for hero image and gallery images
 */
export async function getUnsplashImagesForPlace(
  placeName: string,
  limit: number = 8
): Promise<UnsplashImage[]> {
  const unsplash = getUnsplashClient();
  if (!unsplash) {
    return [];
  }

  const query = `${placeName} India travel landscape`;

  const response = await unsplash.search.getPhotos({
    query,
    page: 1,
    perPage: Math.min(limit, 30),
    orientation: "landscape",
    contentFilter: "high",
  });

  if (response.type === "error") {
    return [];
  }

  return response.response.results.map((photo) => ({
    imageUrl: photo.urls.regular,
    imageThumbUrl: photo.urls.small,
    imageAlt: photo.alt_description || `${placeName} travel image`,
    photographerName: photo.user.name,
    photographerProfile: photo.user.links.html,
  }));
}
