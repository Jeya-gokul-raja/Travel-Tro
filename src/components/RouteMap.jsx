import { useEffect, useState } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";

const RouteMap = ({ route }) => {
  const [mapError, setMapError] = useState(null);

  // Function to get coordinates for a stop (simulated coordinates for Madurai area)
  const getStopCoordinates = (stopName) => {
    const baseCoords = [9.9252, 78.1198]; // Madurai center [lat, lng]
    return [
      baseCoords[0] + (Math.random() - 0.5) * 0.02,
      baseCoords[1] + (Math.random() - 0.5) * 0.02,
    ];
  };

  if (mapError) {
    return (
      <div className="h-[400px] w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg">{mapError}</p>
          <p className="text-sm mt-2">
            Please check your internet connection and try again
          </p>
        </div>
      </div>
    );
  }

  try {
    if (route.isConnectingRoute) {
      const firstRouteCoords = route.firstRoute.stops.map(getStopCoordinates);
      const secondRouteCoords = route.secondRoute.stops.map(getStopCoordinates);
      const allCoords = [...firstRouteCoords, ...secondRouteCoords];

      // Calculate bounds for the map
      const bounds = allCoords.reduce(
        (acc, coord) => ({
          minLat: Math.min(acc.minLat, coord[0]),
          maxLat: Math.max(acc.maxLat, coord[0]),
          minLng: Math.min(acc.minLng, coord[1]),
          maxLng: Math.max(acc.maxLng, coord[1]),
        }),
        {
          minLat: Infinity,
          maxLat: -Infinity,
          minLng: Infinity,
          maxLng: -Infinity,
        }
      );

      const center = [
        (bounds.minLat + bounds.maxLat) / 2,
        (bounds.minLng + bounds.maxLng) / 2,
      ];

      return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden">
          <Map center={center} zoom={13} attribution={false}>
            {/* First route line */}
            <Overlay anchor={[0, 0]} offset={[0, 0]}>
              <svg
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                }}
              >
                <polyline
                  points={firstRouteCoords
                    .map((coord) => `${coord[1]},${coord[0]}`)
                    .join(" ")}
                  style={{
                    fill: "none",
                    stroke: "#2563eb",
                    strokeWidth: "6",
                    opacity: 0.8,
                  }}
                />
                <polyline
                  points={secondRouteCoords
                    .map((coord) => `${coord[1]},${coord[0]}`)
                    .join(" ")}
                  style={{
                    fill: "none",
                    stroke: "#059669",
                    strokeWidth: "6",
                    opacity: 0.8,
                  }}
                />
              </svg>
            </Overlay>

            {/* First route markers */}
            {route.firstRoute.relevantStops.map((stop, index) => {
              const coords = getStopCoordinates(stop);
              const isTransferPoint =
                stop.toLowerCase() === route.commonStop.toLowerCase();

              return (
                <Marker
                  key={`first-${index}`}
                  width={isTransferPoint ? 24 : 16}
                  anchor={coords}
                  color={isTransferPoint ? "#fbbf24" : "#2563eb"}
                  onClick={() =>
                    alert(
                      `${stop}${isTransferPoint ? " (Transfer Point)" : ""}`
                    )
                  }
                ></Marker>
              );
            })}

            {/* Second route markers */}
            {route.secondRoute.relevantStops.map((stop, index) => {
              if (stop.toLowerCase() !== route.commonStop.toLowerCase()) {
                const coords = getStopCoordinates(stop);
                return (
                  <Marker
                    key={`second-${index}`}
                    width={16}
                    anchor={coords}
                    color="#059669"
                    onClick={() => alert(stop)}
                  />
                );
              }
              return null;
            })}
          </Map>
        </div>
      );
    } else {
      // Single route
      const routeCoords = route.stops.map(getStopCoordinates);
      const bounds = routeCoords.reduce(
        (acc, coord) => ({
          minLat: Math.min(acc.minLat, coord[0]),
          maxLat: Math.max(acc.maxLat, coord[0]),
          minLng: Math.min(acc.minLng, coord[1]),
          maxLng: Math.max(acc.maxLng, coord[1]),
        }),
        {
          minLat: Infinity,
          maxLat: -Infinity,
          minLng: Infinity,
          maxLng: -Infinity,
        }
      );

      const center = [
        (bounds.minLat + bounds.maxLat) / 2,
        (bounds.minLng + bounds.maxLng) / 2,
      ];

      return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden">
          <Map center={center} zoom={13} attribution={false}>
            {/* Route line */}
            <Overlay anchor={[0, 0]} offset={[0, 0]}>
              <svg
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                }}
              >
                <polyline
                  points={routeCoords
                    .map((coord) => `${coord[1]},${coord[0]}`)
                    .join(" ")}
                  style={{
                    fill: "none",
                    stroke: "#2563eb",
                    strokeWidth: "6",
                    opacity: 0.8,
                  }}
                />
              </svg>
            </Overlay>

            {/* Stop markers */}
            {route.stops.map((stop, index) => {
              const coords = getStopCoordinates(stop);
              return (
                <Marker
                  key={index}
                  width={16}
                  anchor={coords}
                  color="#2563eb"
                  onClick={() => alert(stop)}
                />
              );
            })}
          </Map>
        </div>
      );
    }
  } catch (error) {
    console.error("Map initialization error:", error);
    setMapError("Failed to initialize map");
    return null;
  }
};

export default RouteMap;
