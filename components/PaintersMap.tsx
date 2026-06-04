"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Painter } from "@/lib/types";
import { painterLatLng, COIMBATORE_CENTER } from "@/lib/geo";

// A friendly coral map pin (avoids Leaflet's broken default icon paths).
const pin = L.divIcon({
  className: "",
  html: `<div style="
    width:30px;height:30px;border-radius:50% 50% 50% 0;
    background:linear-gradient(135deg,#FF7A59,#8B5CF6);
    transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,.3);
    display:flex;align-items:center;justify-content:center;">
    <span style="transform:rotate(45deg);font-size:14px;">🎨</span>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

export default function PaintersMap({ painters }: { painters: Painter[] }) {
  const center = painters.length ? painterLatLng(painters[0]) : COIMBATORE_CENTER;
  const zoom = painters.length ? 12 : 11;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "520px", width: "100%" }}
      className="overflow-hidden rounded-xl2 shadow-soft"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {painters.map((p) => {
        const [lat, lng] = painterLatLng(p);
        return (
          <Marker key={p.id} position={[lat, lng]} icon={pin}>
            <Popup>
              <div style={{ textAlign: "center", minWidth: 140 }}>
                <img
                  src={p.photo}
                  alt={p.name}
                  style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", margin: "0 auto 6px" }}
                />
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  📍 {p.area ? `${p.area}, ` : ""}{p.city} · ⭐ {p.rating.toFixed(1)}
                </div>
                <div style={{ fontSize: 12, marginTop: 2 }}>From ₹{p.pricePerDay}/day</div>
                <a
                  href={`/painters/${p.id}`}
                  style={{
                    display: "inline-block", marginTop: 8, padding: "5px 14px", borderRadius: 999,
                    background: "linear-gradient(90deg,#FF7A59,#8B5CF6)", color: "#fff",
                    fontWeight: 700, fontSize: 12, textDecoration: "none",
                  }}
                >
                  View profile →
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
