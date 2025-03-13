import { useState } from "react";
import { destinations as destinationsList } from "../data/destinations";
import { busRoutes as busRoutesList } from "../data/busRoutes";
import BusInfo from "./BusInfo";

const Home = () => {
  const [destinations, setDestinations] = useState({
    start: "",
    end: "",
  });
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState({
    start: [],
    end: [],
  });
  const [availableRoutes, setAvailableRoutes] = useState(null);
  const [showBusInfo, setShowBusInfo] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDestinations((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");

    // Filter suggestions based on input value
    if (value.trim()) {
      const filtered = destinationsList.filter((dest) =>
        dest.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions((prev) => ({
        ...prev,
        [name]: filtered.slice(0, 5),
      }));
    } else {
      setSuggestions((prev) => ({
        ...prev,
        [name]: [],
      }));
    }
  };

  const handleSuggestionClick = (name, value) => {
    setDestinations((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuggestions((prev) => ({
      ...prev,
      [name]: [],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destinations.start || !destinations.end) {
      setError("Please fill in both starting and ending destinations");
      return;
    }

    // First try to find direct routes
    const directRoutes = busRoutesList.filter((route) => {
      const stops = route.stops.map((stop) => stop.toLowerCase());
      return (
        stops.includes(destinations.start.toLowerCase()) &&
        stops.includes(destinations.end.toLowerCase())
      );
    });

    if (directRoutes.length > 0) {
      setAvailableRoutes(directRoutes);
      setShowBusInfo(true);
      return;
    }

    // If no direct routes, find connecting routes
    const connectingRoutes = [];

    busRoutesList.forEach((firstRoute) => {
      const firstStops = firstRoute.stops.map((stop) => stop.toLowerCase());

      // Check if first route contains starting point
      if (firstStops.includes(destinations.start.toLowerCase())) {
        busRoutesList.forEach((secondRoute) => {
          if (firstRoute.busNumber !== secondRoute.busNumber) {
            const secondStops = secondRoute.stops.map((stop) =>
              stop.toLowerCase()
            );

            // Check if second route contains destination
            if (secondStops.includes(destinations.end.toLowerCase())) {
              // Find common stops between routes
              const commonStops = firstStops.filter((stop) =>
                secondStops.includes(stop)
              );

              // Find the optimal transfer point based on the direction of travel
              if (commonStops.length > 0) {
                // Get indices of start and common stops in first route
                const startIndex = firstRoute.stops.findIndex(
                  (stop) =>
                    stop.toLowerCase() === destinations.start.toLowerCase()
                );
                const commonStopIndices = commonStops.map((stop) => ({
                  stop: stop,
                  firstRouteIndex: firstRoute.stops.findIndex(
                    (s) => s.toLowerCase() === stop.toLowerCase()
                  ),
                  secondRouteIndex: secondRoute.stops.findIndex(
                    (s) => s.toLowerCase() === stop.toLowerCase()
                  ),
                }));

                // Select the optimal transfer point
                const optimalTransfer = commonStopIndices.reduce(
                  (best, current) => {
                    if (!best) return current;

                    // Calculate scores based on position in routes
                    const bestScore = Math.abs(
                      best.firstRouteIndex - startIndex
                    );
                    const currentScore = Math.abs(
                      current.firstRouteIndex - startIndex
                    );

                    return currentScore < bestScore ? current : best;
                  },
                  null
                );

                const optimalStop = optimalTransfer.stop;
                // Create a combined route object
                const combinedRoute = {
                  busNumber: `${firstRoute.busNumber} → ${secondRoute.busNumber}`,
                  startTime: firstRoute.startTime,
                  endTime: secondRoute.endTime,
                  frequency: `${firstRoute.frequency} / ${secondRoute.frequency}`,
                  fare: `₹${
                    parseInt(firstRoute.fare.replace("₹", "")) +
                    parseInt(secondRoute.fare.replace("₹", ""))
                  }`,
                  isConnectingRoute: true,
                  commonStop: optimalStop,
                  firstRoute: {
                    ...firstRoute,
                    relevantStops: firstRoute.stops.slice(
                      firstRoute.stops.findIndex(
                        (stop) =>
                          stop.toLowerCase() ===
                          destinations.start.toLowerCase()
                      ),
                      firstRoute.stops.findIndex(
                        (stop) =>
                          stop.toLowerCase() === optimalStop.toLowerCase()
                      ) + 1
                    ),
                  },
                  secondRoute: {
                    ...secondRoute,
                    relevantStops: secondRoute.stops.slice(
                      secondRoute.stops.findIndex(
                        (stop) =>
                          stop.toLowerCase() === optimalStop.toLowerCase()
                      ),
                      secondRoute.stops.findIndex(
                        (stop) =>
                          stop.toLowerCase() === destinations.end.toLowerCase()
                      ) + 1
                    ),
                  },
                };
                connectingRoutes.push(combinedRoute);
              }
            }
          }
        });
      }
    });

    setAvailableRoutes(connectingRoutes);
    setShowBusInfo(true);
  };

  const handleBack = () => {
    setShowBusInfo(false);
  };

  if (showBusInfo && availableRoutes) {
    return <BusInfo availableRoutes={availableRoutes} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white text-center">
          Travel Tro
        </h2>
        <p className="text-blue-100 text-center mt-2">
          Find your bus route easily
        </p>
      </div>
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="relative">
                <label
                  htmlFor="start"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Starting Point
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="start"
                    name="start"
                    value={destinations.start}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 text-base border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    placeholder="Enter starting location"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
                {suggestions.start.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                    {suggestions.start.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center space-x-3"
                        onClick={() =>
                          handleSuggestionClick("start", suggestion)
                        }
                      >
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <label
                  htmlFor="end"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Destination
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="end"
                    name="end"
                    value={destinations.end}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 text-base border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    placeholder="Enter destination"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                  </div>
                </div>
                {suggestions.end.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                    {suggestions.end.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center space-x-3"
                        onClick={() => handleSuggestionClick("end", suggestion)}
                      >
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Find Route
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
