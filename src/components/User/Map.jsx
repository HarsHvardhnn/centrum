import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
  return (
    <div className="w-full flex justify-center mt-12 px-4">
      <MapContainer
        center={[51.11, 20.85]}
        zoom={13}
        className="w-full max-w-4xl h-[300px] md:h-[400px] lg:h-[500px] rounded-lg shadow-md z-0"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[51.11, 20.85]}>
          <Popup>Centrum Medyczne</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Map;
