import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const Map = () => {
  const center = {
    lat: 51.11,
    lng: 20.85
  };

  const mapStyles = {
    height: "400px",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  return (
    <div className="w-full flex justify-center mt-12 px-4">
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={15}
          center={center}
          mapTypeId="satellite"
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default Map;
