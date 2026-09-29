import React, { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from '../../components/NasanMap';

import BusCard from '../../components/BusCard';
import BusMarker from '../../components/BusMarker';
import Header from '../../components/Header';
import { useBuses } from '../../context/BusContext';

const FALLBACK_LOCATION = {
  latitude: 14.2785,
  longitude: 120.9043,
};

const isCoordinate = (value) =>
  value && Number.isFinite(value.latitude) && Number.isFinite(value.longitude);

const getBusCoordinate = (bus) => {
  const coordinate = bus?.coordinates || bus?.location;
  return isCoordinate(coordinate) ? coordinate : null;
};

const getRoutePoints = (bus) =>
  (Array.isArray(bus?.routePoints) ? bus.routePoints : [])
    .map((point) => point?.coordinates || point)
    .filter(isCoordinate);

const mapRegionFor = (coordinate) => ({
  latitude: coordinate.latitude,
  longitude: coordinate.longitude,
  latitudeDelta: 0.075,
  longitudeDelta: 0.075,
});

export default function PassengerMapScreen({ navigation }) {
  const { buses = [], passengerLocation } = useBuses();
  const mapRef = useRef(null);
  const [selectedBusId, setSelectedBusId] = useState(null);

  const passengerCoordinate = isCoordinate(passengerLocation)
    ? passengerLocation
    : FALLBACK_LOCATION;
  const initialRegion = useMemo(
    () => mapRegionFor(passengerCoordinate),
    [passengerCoordinate.latitude, passengerCoordinate.longitude],
  );
  const selectedBus = useMemo(
    () =>
      buses.find((bus) => String(bus.id) === String(selectedBusId)) ||
      buses[0] ||
      null,
    [buses, selectedBusId],
  );
  const selectedRoute = getRoutePoints(selectedBus);

  const openBusDetails = (bus) => {
    if (bus?.id && navigation?.navigate) {
      navigation.navigate('BusDetails', { busId: bus.id });
    }
  };

  const centerOnPassenger = () => {
    mapRef.current?.animateToRegion(mapRegionFor(passengerCoordinate), 350);
  };

  const selectBus = (bus) => {
    const coordinate = getBusCoordinate(bus);
    setSelectedBusId(bus.id);
    if (coordinate) {
      mapRef.current?.animateToRegion(mapRegionFor(coordinate), 350);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.safeArea.backgroundColor} />
      <Header title="Live Map" subtitle="Buses around General Trias" />

      <View style={styles.mapArea}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsCompass={false}
          showsScale={false}
          toolbarEnabled={false}
        >
          {selectedRoute.length > 1 ? (
            <Polyline
              coordinates={selectedRoute}
              strokeColor="#2C7BE5"
              strokeWidth={4}
              lineCap="round"
            />
          ) : null}

          <Marker coordinate={passengerCoordinate} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.passengerMarkerOuter}>
              <View style={styles.passengerMarkerInner} />
            </View>
          </Marker>

          {buses.map((bus) => {
            if (!getBusCoordinate(bus)) {
              return null;
            }

            return (
              <BusMarker
                key={String(bus.id)}
                bus={bus}
                selected={String(bus.id) === String(selectedBus?.id)}
                onPress={() => selectBus(bus)}
              />
            );
          })}
        </MapView>

        <View pointerEvents="none" style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.youLegendDot} />
            <Text style={styles.legendText}>You</Text>
          </View>
          <View style={styles.legendDivider} />
          <View style={styles.legendItem}>
            <View style={styles.busLegendDot} />
            <Text style={styles.legendText}>Bus</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Center map on your location"
          onPress={centerOnPassenger}
          style={({ pressed }) => [styles.locationControl, pressed && styles.pressed]}
        >
          <Text style={styles.locationControlIcon}>◎</Text>
        </Pressable>

        {selectedBus ? (
          <View style={styles.selectedPanel}>
            <View style={styles.panelHandle} />
            <View style={styles.panelHeading}>
              <View>
                <Text style={styles.panelTitle}>Selected bus</Text>
                <Text style={styles.panelSubtitle}>Tap a marker to switch buses</Text>
              </View>
              <Text style={styles.panelCounter}>{buses.length} nearby</Text>
            </View>
            <BusCard bus={selectedBus} onPress={() => openBusDetails(selectedBus)} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${selectedBus.busNumber} details`}
              onPress={() => openBusDetails(selectedBus)}
              style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
            >
              <Text style={styles.detailsButtonText}>View bus details</Text>
              <Text style={styles.detailsArrow}>→</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyPanel}>
            <Text style={styles.emptyPanelTitle}>No buses on the map</Text>
            <Text style={styles.emptyPanelText}>Bus markers will appear here when available.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  mapArea: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  passengerMarkerOuter: {
    alignItems: 'center',
    backgroundColor: 'rgba(44, 123, 229, 0.23)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  passengerMarkerInner: {
    backgroundColor: '#2C7BE5',
    borderColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 3,
    height: 20,
    width: 20,
  },
  legend: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 999,
    flexDirection: 'row',
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    shadowColor: '#12263F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  youLegendDot: {
    backgroundColor: '#2C7BE5',
    borderColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    width: 12,
  },
  busLegendDot: {
    backgroundColor: '#21A768',
    borderColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    width: 12,
  },
  legendText: {
    color: '#425773',
    fontSize: 11,
    fontWeight: '800',
  },
  legendDivider: {
    backgroundColor: '#DCE5EF',
    height: 16,
    marginHorizontal: 10,
    width: 1,
  },
  locationControl: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    bottom: 276,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    shadowColor: '#12263F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: 42,
  },
  locationControlIcon: {
    color: '#1D4C80',
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 26,
  },
  selectedPanel: {
    backgroundColor: '#F5F8FC',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    bottom: 0,
    padding: 16,
    paddingBottom: 18,
    position: 'absolute',
    width: '100%',
  },
  panelHandle: {
    alignSelf: 'center',
    backgroundColor: '#C8D4E2',
    borderRadius: 999,
    height: 4,
    marginBottom: 12,
    width: 42,
  },
  panelHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  panelTitle: {
    color: '#18324F',
    fontSize: 16,
    fontWeight: '800',
  },
  panelSubtitle: {
    color: '#74849A',
    fontSize: 11,
    marginTop: 2,
  },
  panelCounter: {
    color: '#168654',
    fontSize: 11,
    fontWeight: '800',
  },
  detailsButton: {
    alignItems: 'center',
    backgroundColor: '#2C7BE5',
    borderRadius: 13,
    flexDirection: 'row',
    height: 46,
    justifyContent: 'center',
    marginTop: 2,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  detailsArrow: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginLeft: 9,
  },
  emptyPanel: {
    backgroundColor: '#F5F8FC',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    bottom: 0,
    padding: 24,
    position: 'absolute',
    width: '100%',
  },
  emptyPanelTitle: {
    color: '#18324F',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyPanelText: {
    color: '#74849A',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
