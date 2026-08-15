// Thin fetch wrappers replacing utils/supabaseRequest.ts. Same exported names and call
// shapes minus token/userId (the server derives userId from the Clerk session, never
// from the client) so call sites change by import swap only.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const insertUser = async ({ username }: { username: string }) => {
  const res = await fetch("/api/users", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
  return json(res);
};

export const createTrip = async ({
  trip_name,
  daterange,
  image_url,
}: {
  trip_name: string;
  daterange: { from: Date; to: Date };
  image_url: string;
}) => {
  const res = await fetch("/api/trips", {
    method: "POST",
    body: JSON.stringify({ trip_name, daterange, image_url }),
  });
  if (res.status === 409) return { message: "Trip Name already taken." };
  return json(res);
};

export const getTrips = async () => {
  const res = await fetch("/api/trips");
  return json(res);
};

export const updateTrip = async ({ trip_name, imageURL }: { trip_name: string; imageURL: string }) => {
  const res = await fetch("/api/trips", {
    method: "PATCH",
    body: JSON.stringify({ trip_name, imageURL }),
  });
  return json(res);
};

export const deleteTrip = async ({ trip_name }: { trip_name: string }) => {
  const res = await fetch("/api/trips", {
    method: "DELETE",
    body: JSON.stringify({ trip_name }),
  });
  return json(res);
};

export const getLog = async ({ day, trip_name }: { day: number; trip_name: string }) => {
  const res = await fetch(`/api/logs?trip_name=${encodeURIComponent(trip_name)}&day=${day}`);
  return json(res);
};

export const getAllLogs = async ({ trip_name }: { trip_name: string }) => {
  const res = await fetch(`/api/logs?trip_name=${encodeURIComponent(trip_name)}`);
  return json(res);
};

export const editLog = async ({
  trip_name,
  day,
  entry,
  title,
  loc,
}: {
  trip_name: string;
  day: number;
  entry: string;
  title: string;
  loc: string;
}) => {
  const res = await fetch("/api/logs", {
    method: "PATCH",
    body: JSON.stringify({ trip_name, day, entry, title, loc }),
  });
  return json(res);
};

export const getPhotos = async ({
  trip_name,
  start_day,
  end_day,
}: {
  trip_name: string;
  start_day: number;
  end_day: number;
}) => {
  const params = new URLSearchParams({
    trip_name,
    start_day: String(start_day),
    end_day: String(end_day),
  });
  const res = await fetch(`/api/photos?${params}`);
  return json(res);
};

export const insertPhotos = async ({
  trip_name,
  day,
  imageURL,
  lat,
  long,
  area,
}: {
  trip_name: string;
  day: number;
  imageURL: string;
  lat: number;
  long: number;
  area: string;
}) => {
  const res = await fetch("/api/photos", {
    method: "POST",
    body: JSON.stringify({ trip_name, day, imageURL, lat, long, area }),
  });
  return json(res);
};

export const deletePhotos = async ({
  trip_name,
  day,
  imageURL,
}: {
  trip_name: string;
  day: number;
  imageURL: string;
}) => {
  const res = await fetch("/api/photos", {
    method: "DELETE",
    body: JSON.stringify({ trip_name, day, imageURL }),
  });
  return json(res);
};

export const updateLatLong = async ({
  trip_name,
  imageURL,
  lat,
  long,
  area,
}: {
  trip_name: string;
  imageURL: string;
  lat: number;
  long: number;
  area: string;
}) => {
  const res = await fetch("/api/photos", {
    method: "PATCH",
    body: JSON.stringify({ trip_name, imageURL, lat, long, area }),
  });
  return json(res);
};

export const uploadBackgroundToSupabase = async (file: File, bucketName: string) => {
  const form = new FormData();
  form.append("file", file);
  form.append("bucketName", bucketName);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const { imageURL } = await json(res);
  return imageURL as string;
};

export const uploadPhotosToSupabase = async (
  day: number,
  trip_name: string,
  file: File,
  bucketName: string
) => {
  const form = new FormData();
  form.append("file", file);
  form.append("bucketName", bucketName);
  form.append("trip_name", trip_name);
  form.append("day", String(day));
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const { imageURL } = await json(res);
  return imageURL as string;
};

export const getPhotoLocation = async (photo: File, location: string) => {
  const form = new FormData();
  form.append("mode", "photo");
  form.append("photo", photo);
  form.append("location", location);
  const res = await fetch("/api/geo", { method: "POST", body: form });
  return json(res);
};

export const getCoords = async (location: string) => {
  const form = new FormData();
  form.append("mode", "text");
  form.append("location", location);
  const res = await fetch("/api/geo", { method: "POST", body: form });
  return json(res);
};
