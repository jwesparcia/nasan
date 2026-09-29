import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
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

/**
 * The passenger dashboard intentionally reads straight from BusContext, so
 * changes made in the driver dashboard are visible as soon as this screen is
 * revisited. The locations remain mock coordinates for the prototype.
 */
export default function PassengerHomeScreen({ navigation }) {
  const { buses = [], passengerLocation } = useBuses();
  const [selectedBusId, setSelectedBusId] = useState(null);

  const passengerCoordinate = isCoordinate(passengerLocation)
    ? passengerLocation
    : FALLBACK_LOCATION;
  const selectedBus = useMemo(
    () =>
      buses.find((bus) => String(bus.id) === String(selectedBusId)) ||
      buses[0] ||
      null,
    [buses, selectedBusId],
  );
  const selectedRoute = getRoutePoints(selectedBus);
  const initialRegion = useMemo(
    () => mapRegionFor(passengerCoordinate),
    [passengerCoordinate.latitude, passengerCoordinate.longitude],
  );

  const openBusDetails = (bus) => {
    if (!bus?.id || !navigation?.navigate) {
      return;
    }

    navigation.navigate('BusDetails', { busId: bus.id });
  };

  const openMap = () => {
    if (navigation?.navigate) {
      navigation.navigate('PassengerMap');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.safeArea.backgroundColor} />
      <Header title="NASAN" subtitle="General Trias, Cavite" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.eyebrow}>YOUR RIDE, AT A GLANCE</Text>
            <Text style={styles.heading}>Buses near you</Text>
          </View>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsCompass={false}
            showsScale={false}
            showsUserLocation={false}
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
              const coordinate = getBusCoordinate(bus);
              if (!coordinate) {
                return null;
              }

              return (
                <BusMarker
                  key={String(bus.id)}
                  bus={bus}
                  selected={String(bus.id) === String(selectedBus?.id)}
                  onPress={() => {
                    setSelectedBusId(bus.id);
                    openBusDetails(bus);
                  }}
                />
              );
            })}
          </MapView>

          <View pointerEvents="none" style={styles.locationBadge}>
            <Text style={styles.locationBadgeText}>● You are here</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open full bus map"
            onPress={openMap}
            style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}
          >
            <Text style={styles.expandIcon}>⌗</Text>
          </Pressable>

          {selectedBus ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${selectedBus.busNumber}`}
              onPress={() => openBusDetails(selectedBus)}
              style={({ pressed }) => [styles.mapSummary, pressed && styles.pressed]}
            >
              <View style={styles.summaryBusIcon}>
                <Text style={styles.summaryBusIconText}>BUS</Text>
              </View>
              <View style={styles.summaryCopy}>
                <Text numberOfLines={1} style={styles.summaryBusNumber}>
                  {selectedBus.busNumber || 'BUS'}
                </Text>
                <Text numberOfLines={1} style={styles.summaryRoute}>
                  {selectedBus.route || 'Route information'}
                </Text>
              </View>
              <View style={styles.summaryEta}>
                <Text style={styles.summaryEtaLabel}>ETA</Text>
                <Text style={styles.summaryEtaValue}>{selectedBus.eta || '--'}</Text>
              </View>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Arriving buses</Text>
            <Text style={styles.sectionSubtitle}>
              {buses.length ? `${buses.length} buses on nearby routes` : 'No buses available'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See all buses on map"
            onPress={openMap}
            hitSlop={8}
          >
            <Text style={styles.seeMapText}>See map →</Text>
          </Pressable>
        </View>

        {buses.length ? (
          buses.map((bus) => (
            <BusCard
              key={String(bus.id)}
              bus={bus}
              onPress={() => {
                setSelectedBusId(bus.id);
                openBusDetails(bus);
              }}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No buses nearby yet</Text>
            <Text style={styles.emptyStateText}>Check the map again in a moment.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },
  welcomeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  eyebrow: {
    color: '#6C7A90',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  heading: {
    color: '#12263F',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  livePill: {
    alignItems: 'center',
    backgroundColor: '#E8F8EF',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveDot: {
    backgroundColor: '#21A768',
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  liveText: {
    color: '#168654',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  mapCard: {
    borderColor: '#E2EAF4',
    borderRadius: 24,
    borderWidth: 1,
    height: 290,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#183B68',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  passengerMarkerOuter: {
    alignItems: 'center',
    backgroundColor: 'rgba(44, 123, 229, 0.22)',
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
  locationBadge: {
    backgroundColor: 'rgba(18, 38, 63, 0.86)',
    borderRadius: 999,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
    top: 12,
  },
  locationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  expandButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    shadowColor: '#12263F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    top: 12,
    width: 36,
  },
  expandIcon: {
    color: '#1D4C80',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 22,
  },
  mapSummary: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    bottom: 12,
    flexDirection: 'row',
    left: 12,
    padding: 10,
    position: 'absolute',
    right: 12,
    shadowColor: '#12263F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  summaryBusIcon: {
    alignItems: 'center',
    backgroundColor: '#E8F1FD',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    marginRight: 10,
    width: 38,
  },
  summaryBusIconText: {
    color: '#2C7BE5',
    fontSize: 8,
    fontWeight: '900',
  },
  summaryCopy: {
    flex: 1,
    marginRight: 8,
  },
  summaryBusNumber: {
    color: '#12263F',
    fontSize: 14,
    fontWeight: '800',
  },
  summaryRoute: {
    color: '#6C7A90',
    fontSize: 11,
    marginTop: 2,
  },
  summaryEta: {
    alignItems: 'flex-end',
  },
  summaryEtaLabel: {
    color: '#8492A6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  summaryEtaValue: {
    color: '#168654',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#12263F',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    color: '#75849A',
    fontSize: 12,
    marginTop: 3,
  },
  seeMapText: {
    color: '#2C7BE5',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E4EBF4',
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 28,
  },
  emptyStateTitle: {
    color: '#233A56',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyStateText: {
    color: '#75849A',
    fontSize: 13,
    marginTop: 6,
  },
  pressed: {
    opacity: 0.78,
  },
});
