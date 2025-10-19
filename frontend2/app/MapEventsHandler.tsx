"use client";

import { useMapEvent } from "react-leaflet";
import { LatLng } from "leaflet";

interface Props {
  setCoordinates: React.Dispatch<React.SetStateAction<[number, number][]>>;
}

export default function MapEventsHandler({ setCoordinates }: Props) {
  useMapEvent("click", (e) => {
    const { lat, lng } = e.latlng;

    setCoordinates((prev) => {
      // tambahkan titik baru
      const updated = [...prev, [lat, lng]];

      // jika sudah 4 titik, tutup polygon dengan mengulang titik awal
      if (updated.length === 4) {
        return [...updated, updated[0]];
      }
      return updated;
    });
  });

  return null;
}
