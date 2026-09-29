import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  BUS_101_ID,
  createInitialBuses,
  passengerLocation,
} from '../data/mockBuses';

const BusContext = createContext(undefined);

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

const sameBus = (bus, busId) =>
  String(bus.id) === String(busId) ||
  String(bus.busNumber).replace(/\D/g, '') === String(busId).replace(/\D/g, '');

const setAvailability = (bus, isAvailable) => {
  if (!isAvailable) {
    return {
      ...bus,
      isAvailable: false,
      // Preserve the route state so it can be restored when the driver turns
      // service back on. Passenger detail views can now show Not Available.
      lastActiveStatus: bus.status === 'Not Available' ? bus.lastActiveStatus : bus.status,
      status: 'Not Available',
    };
  }

  return {
    ...bus,
    isAvailable: true,
    // Seat capacity takes precedence when service is turned back on. A bus
    // that filled up while marked unavailable must return as Full, not as an
    // arriving bus with zero seats.
    status:
      bus.availableSeats <= 0
        ? 'Full'
        : bus.lastActiveStatus && bus.lastActiveStatus !== 'Full'
          ? bus.lastActiveStatus
          : 'Arriving',
    lastActiveStatus: undefined,
  };
};

/**
 * Shared in-memory state for the static NASAN demonstration. It deliberately
 * resets on an app reload: there is no API, database, GPS source, or real-time
 * service behind this prototype.
 */
export function BusProvider({ children }) {
  const [buses, setBuses] = useState(createInitialBuses);

  const getBusById = useCallback(
    (busId) => buses.find((bus) => sameBus(bus, busId)),
    [buses],
  );

  /**
   * Applies a signed change to the number of open seats. For example, -1 is
   * used when a passenger boards and +1 is used when a passenger gets off.
   */
  const adjustSeats = useCallback((busId = BUS_101_ID, amount = 0) => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return;

    setBuses((currentBuses) =>
      currentBuses.map((bus) => {
        if (!sameBus(bus, busId)) return bus;

        const availableSeats = clamp(
          bus.availableSeats + numericAmount,
          0,
          bus.totalSeats,
        );

        return {
          ...bus,
          availableSeats,
          // Keep the passenger-facing label truthful as the counter crosses
          // zero. The driver availability switch still controls service.
          status:
            bus.isAvailable === false
              ? 'Not Available'
              : availableSeats <= 0
                ? 'Full'
                : bus.status === 'Full'
                  ? 'Arriving'
                  : bus.status,
        };
      }),
    );
  }, []);

  const addPassenger = useCallback(
    (busId = BUS_101_ID) => adjustSeats(busId, -1),
    [adjustSeats],
  );

  const removePassenger = useCallback(
    (busId = BUS_101_ID) => adjustSeats(busId, 1),
    [adjustSeats],
  );

  /** Driver-controlled availability; the regular route status is preserved. */
  const updateBusAvailability = useCallback(
    (busId = BUS_101_ID, isAvailable = true) => {
      setBuses((currentBuses) =>
        currentBuses.map((bus) =>
          sameBus(bus, busId)
            ? setAvailability(bus, Boolean(isAvailable))
            : bus,
        ),
      );
    },
    [],
  );

  const toggleBusAvailability = useCallback((busId = BUS_101_ID) => {
    setBuses((currentBuses) =>
      currentBuses.map((bus) =>
        sameBus(bus, busId) ? setAvailability(bus, !bus.isAvailable) : bus,
      ),
    );
  }, []);

  const updateBusStatus = useCallback((busId = BUS_101_ID, status) => {
    if (!status) return;

    setBuses((currentBuses) =>
      currentBuses.map((bus) =>
        sameBus(bus, busId) ? { ...bus, status } : bus,
      ),
    );
  }, []);

  /**
   * Steps a bus to the next fixed route coordinate. This is a local visual
   * demo only—no device location, background task, or GPS tracking is used.
   */
  const simulateMovement = useCallback((busId = BUS_101_ID) => {
    setBuses((currentBuses) =>
      currentBuses.map((bus) => {
        if (!sameBus(bus, busId) || !bus.routePoints?.length) return bus;

        const nextRouteIndex = (bus.routeIndex + 1) % bus.routePoints.length;
        const nextCoordinates = bus.routePoints[nextRouteIndex];
        const nextStop = bus.routeStops?.find(
          (stop) =>
            stop.latitude === nextCoordinates.latitude &&
            stop.longitude === nextCoordinates.longitude,
        );

        return {
          ...bus,
          routeIndex: nextRouteIndex,
          coordinates: { ...nextCoordinates },
          currentLocationLabel: nextStop?.name || 'On route to destination',
          currentLocation: nextStop?.name || 'On route to destination',
        };
      }),
    );
  }, []);

  const resetBuses = useCallback(() => setBuses(createInitialBuses()), []);

  const value = useMemo(
    () => ({
      buses,
      bus101: buses.find((bus) => sameBus(bus, BUS_101_ID)),
      passengerLocation,
      getBusById,
      adjustSeats,
      addPassenger,
      removePassenger,
      updateBusAvailability,
      // Alias makes a Switch handler read naturally in screens.
      setBusAvailability: updateBusAvailability,
      toggleBusAvailability,
      // Short alias for callers that prefer the wording in the brief.
      toggleAvailability: toggleBusAvailability,
      updateBusStatus,
      simulateMovement,
      resetBuses,
    }),
    [
      addPassenger,
      adjustSeats,
      buses,
      getBusById,
      removePassenger,
      resetBuses,
      simulateMovement,
      toggleBusAvailability,
      updateBusAvailability,
      updateBusStatus,
    ],
  );

  return <BusContext.Provider value={value}>{children}</BusContext.Provider>;
}

export function useBuses() {
  const context = useContext(BusContext);

  if (!context) {
    throw new Error('useBuses must be used inside a BusProvider.');
  }

  return context;
}

export default BusContext;
