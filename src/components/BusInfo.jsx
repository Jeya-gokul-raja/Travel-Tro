import { useEffect, useState } from "react";
import RouteMap from "./RouteMap";

const BusInfo = ({ availableRoutes, onBack }) => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [expandedStops, setExpandedStops] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRouteClick = (route) => {
    setSelectedRoute(route);
    setExpandedStops({});
  };

  const handleStopClick = (stopId) => {
    setExpandedStops((prev) => ({
      ...prev,
      [stopId]: !prev[stopId],
    }));
  };

  const getEstimatedTime = (index, totalStops) => {
    const baseTime = new Date();
    const minutesPerStop = 3;
    baseTime.setMinutes(baseTime.getMinutes() + index * minutesPerStop);
    return baseTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStop = (stop, index, totalStops) => {
    const stopId = `${index}-${stop}`;
    const isExpanded = expandedStops[stopId];
    const estimatedTime = getEstimatedTime(index, totalStops);
    return (
      <li key={stopId} className="flex flex-col ml-0">
        <div
          className={`flex items-center cursor-pointer transition-colors duration-200 ${
            isExpanded ? "bg-black" : ""
          }`}
          onClick={() => handleStopClick(stopId)}
        >
          <div className="relative">
            <div className="h-4 w-4 rounded-full bg-black flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </div>
          <div className="ml-4">
            <span className="text-base text-gray-900">{stop}</span>
          </div>
        </div>
        {isExpanded && (
          <div className="ml-8 mt-2 mb-2 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <p className="mb-1">Estimated arrival: {estimatedTime}</p>
              <p className="mb-1">
                Stop number: {index + 1} of {totalStops}
              </p>
              <p>Facilities: Bus shelter, Seating available</p>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-black py-4 px-4 sm:px-6 lg:px-8 flex items-center">
        <button
          onClick={onBack}
          className="text-white hover:text-blue-100 focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Available Routes</h2>
      </div>

      {availableRoutes.length > 0 ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="py-4 px-4">
              {availableRoutes.map((route, index) => (
                <div
                  key={index}
                  onClick={() => handleRouteClick(route)}
                  className={`bg-white rounded-lg shadow-sm mb-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedRoute?.busNumber === route.busNumber
                      ? "ring-2 ring-black"
                      : ""
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-black font-semibold">
                            {route.isConnectingRoute
                              ? route.busNumber.split("→")[0].trim()
                              : route.busNumber}
                          </span>
                        </div>
                        {route.isConnectingRoute && (
                          <>
                            <span className="text-gray-400">→</span>
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-semibold">
                                {route.busNumber.split("→")[1].trim()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {route.frequency}
                        </p>
                        <p className="font-medium text-gray-900">
                          {route.fare}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-2/3 overflow-y-auto bg-gray-50">
            {selectedRoute ? (
              <div className="p-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-black font-semibold text-xl">
                            {selectedRoute.isConnectingRoute
                              ? selectedRoute.busNumber.split("→")[0].trim()
                              : selectedRoute.busNumber}
                          </span>
                        </div>
                        {selectedRoute.isConnectingRoute && (
                          <>
                            <span className="text-gray-400 text-2xl">→</span>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-semibold text-xl">
                                {selectedRoute.busNumber.split("→")[1].trim()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Bus Route Details
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedRoute.frequency}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Fare</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedRoute.fare}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Operating Hours</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedRoute.startTime} - {selectedRoute.endTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <RouteMap route={selectedRoute} />
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Route Stops
                      </h4>
                      <ul className="space-y-4">
                        {selectedRoute.isConnectingRoute ? (
                          <>
                            <div className="mb-4">
                              <span className="text-sm font-medium text-black bg-blue-50 px-2 py-0.5 rounded">
                                Bus{" "}
                                {selectedRoute.busNumber.split("→")[0].trim()}
                              </span>
                            </div>
                            {selectedRoute.firstRoute.relevantStops.map(
                              (stop, index) =>
                                renderStop(
                                  stop,
                                  index,
                                  selectedRoute.firstRoute.relevantStops.length
                                )
                            )}
                            <li className="py-2 px-4 bg-yellow-50 rounded-lg">
                              <p className="text-yellow-600 font-medium">
                                Transfer at: {selectedRoute.commonStop}
                              </p>
                            </li>
                            <div className="mt-4 mb-4">
                              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                Bus{" "}
                                {selectedRoute.busNumber.split("→")[1].trim()}
                              </span>
                            </div>
                            {selectedRoute.secondRoute.relevantStops.map(
                              (stop, index) =>
                                stop.toLowerCase() !==
                                  selectedRoute.commonStop.toLowerCase() &&
                                renderStop(
                                  stop,
                                  index +
                                    selectedRoute.firstRoute.relevantStops
                                      .length,
                                  selectedRoute.firstRoute.relevantStops
                                    .length +
                                    selectedRoute.secondRoute.relevantStops
                                      .length -
                                    1
                                )
                            )}
                          </>
                        ) : (
                          <>
                            <div className="mb-4">
                              <span className="text-sm font-medium text-black bg-blue-50 px-2 py-0.5 rounded">
                                Bus {selectedRoute.busNumber}
                              </span>
                            </div>
                            {selectedRoute.stops.map((stop, index) =>
                              renderStop(
                                stop,
                                index,
                                selectedRoute.stops.length
                              )
                            )}
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-lg">
                  Select a route to view details
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-lg">
            No routes available for the selected destinations
          </p>
        </div>
      )}
    </div>
  );
};

export default BusInfo;
