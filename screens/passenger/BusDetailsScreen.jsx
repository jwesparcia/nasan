import React, { useMemo } from 'react';
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
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
});

const getStatusStyle = (bus) => {
  const status = String(bus?.status || '').toLowerCase();
  const unavailable = bus?.isAvailable === false || status.includes('full') || status.includes('unavailable');

  return unavailable
    ? { backgroundColor: '#FFF0F0', dot: '#DE3D3D', color: '#BD3030' }
    : { backgroundColor: '#E9F8EF', dot: '#21A768', color: '#168654' };
};

const getCurrentLocation = (bus) => {
  if (bus?.currentLocationLabel || bus?.currentLocation) {
    return bus.currentLocationLabel || bus.currentLocation;
  }

  const firstStop = Array.isArray(bus?.routeStops) ? bus.routeStops[0] : null;
  if (typeof firstStop === 'string') {
    return `Near ${firstStop}`;
  }
  if (firstStop?.name) {
    return `Near ${firstStop.name}`;
  }

  return 'General Trias, Cavite';
};

export default function BusDetailsScreen({ navigation, route }) {
  const { buses = [], getBusById, passengerLocation } = useBuses();
  const busId = route?.params?.busId;
  const bus =
    (typeof getBusById === 'function' ? getBusById(busId) : null) ||
    buses.find((item) => String(item.id) === String(busId));

  const passengerCoordinate = isCoordinate(passengerLocation)
    ? passengerLocation
    : FALLBACK_LOCATION;
  const busCoordinate = getBusCoordinate(bus) || passengerCoordinate;
  const routePoints = getRoutePoints(bus);
  const mapRegion = useMemo(() => mapRegionFor(busCoordinate), [busCoordinate.latitude, busCoordinate.longitude]);

  const goBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation?.navigate?.('PassengerHome');
  };

  const backToMap = () => {
    const routeNames = navigation?.getState?.()?.routeNames || [];

    // When this screen is opened from the passenger tab navigator, its sibling
    // route is available directly. From the root stack, target the nested tab.
    if (navigation?.navigate && routeNames.includes('PassengerMap')) {
      navigation.navigate('PassengerMap');
      return;
    }

    if (navigation?.navigate) {
      navigation.navigate('PassengerArea', { screen: 'PassengerMap' });
      return;
    }

    goBack();
  };

  if (!bus) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={styles.safeArea.backgroundColor} />
        <Header title="Bus Details" subtitle="Live bus information" showBack onBackPress={goBack} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundIcon}>⌁</Text>
          <Text style={styles.notFoundTitle}>Bus not found</Text>
          <Text style={styles.notFoundText}>This bus may no longer be active on the route.</Text>
          <Pressable onPress={goBack} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const availableSeats = Math.max(0, Number(bus.availableSeats) || 0);
  const totalSeats = Math.max(0, Number(bus.totalSeats) || 0);
  const occupiedSeats = Math.max(0, totalSeats - availableSeats);
  const statusStyle = getStatusStyle(bus);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.safeArea.backgroundColor} />
      <Header
        title="Bus Details"
        subtitle="Live bus information"
        showBack
        onBackPress={goBack}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <View style={styles.busEmblem}>
            <Text style={styles.busEmblemText}>BUS</Text>
          </View>
          <View style={styles.titleCopy}>
            <Text style={styles.busNumber}>{bus.busNumber || 'BUS'}</Text>
            <Text numberOfLines={2} style={styles.route}>{bus.route || 'Route information'}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {bus.status || (bus.isAvailable === false ? 'Unavailable' : 'Available')}
            </Text>
          </View>
        </View>

        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            initialRegion={mapRegion}
            showsCompass={false}
            showsScale={false}
            toolbarEnabled={false}
          >
            {routePoints.length > 1 ? (
              <Polyline
                coordinates={routePoints}
                strokeColor="#2C7BE5"
                strokeWidth={4}
                lineCap="round"
              />
            ) : null}
            <Marker coordinate={passengerCoordinate} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.passengerMarker} />
            </Marker>
            <BusMarker bus={bus} selected />
          </MapView>
          <View pointerEvents="none" style={styles.mapLabel}>
            <Text style={styles.mapLabelText}>Current bus location</Text>
          </View>
        </View>

        <View style={styles.availabilityCard}>
          <View>
            <Text style={styles.cardEyebrow}>AVAILABLE SEATS</Text>
            <View style={styles.seatNumberRow}>
              <Text style={styles.seatNumber}>{availableSeats}</Text>
              <Text style={styles.seatTotal}> / {totalSeats}</Text>
            </View>
            <Text style={styles.seatCaption}>seats available right now</Text>
          </View>
          <View style={styles.etaBlock}>
            <Text style={styles.etaIcon}>◷</Text>
            <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
            <Text style={styles.etaValue}>{bus.eta || '--'}</Text>
          </View>
        </View>

        <Text style={styles.detailHeading}>Trip information</Text>
        <View style={styles.detailCard}>
          <DetailRow label="Driver" value={bus.driverName || 'Assigned driver'} icon="●" />
          <View style={styles.divider} />
          <DetailRow label="Current location" value={getCurrentLocation(bus)} icon="⌖" />
          <View style={styles.divider} />
          <DetailRow label="Occupied seats" value={`${occupiedSeats} passengers`} icon="◉" />
          <View style={styles.divider} />
          <DetailRow label="Bus status" value={bus.status || 'Available'} icon="✓" />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to bus map"
          onPress={backToMap}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Back to Map</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, icon }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Text style={styles.detailIconText}>{icon}</Text>
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  content: {
    padding: 20,
    paddingBottom: 34,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 18,
  },
  busEmblem: {
    alignItems: 'center',
    backgroundColor: '#173F70',
    borderRadius: 17,
    height: 54,
    justifyContent: 'center',
    marginRight: 12,
    width: 54,
  },
  busEmblemText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  titleCopy: {
    flex: 1,
    marginRight: 8,
  },
  busNumber: {
    color: '#12263F',
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  route: {
    color: '#68788E',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  statusPill: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    maxWidth: 108,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  statusDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    flexShrink: 1,
  },
  mapCard: {
    borderColor: '#E2EAF4',
    borderRadius: 22,
    borderWidth: 1,
    height: 210,
    marginBottom: 18,
    overflow: 'hidden',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  passengerMarker: {
    backgroundColor: '#2C7BE5',
    borderColor: '#FFFFFF',
    borderRadius: 9,
    borderWidth: 3,
    height: 18,
    width: 18,
  },
  mapLabel: {
    backgroundColor: 'rgba(18, 38, 63, 0.86)',
    borderRadius: 999,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
    top: 12,
  },
  mapLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  availabilityCard: {
    alignItems: 'center',
    backgroundColor: '#173F70',
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 26,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#173F70',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  cardEyebrow: {
    color: '#BBD9FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  seatNumberRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: 2,
  },
  seatNumber: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  seatTotal: {
    color: '#BBD9FF',
    fontSize: 19,
    fontWeight: '700',
  },
  seatCaption: {
    color: '#C9E0FD',
    fontSize: 11,
    marginTop: -2,
  },
  etaBlock: {
    alignItems: 'flex-end',
    maxWidth: 102,
  },
  etaIcon: {
    color: '#90D8BC',
    fontSize: 22,
    lineHeight: 23,
  },
  etaLabel: {
    color: '#BBD9FF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 5,
    textAlign: 'right',
  },
  etaValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  detailHeading: {
    color: '#12263F',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 11,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4EBF4',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22,
    paddingHorizontal: 16,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 63,
  },
  detailIcon: {
    alignItems: 'center',
    backgroundColor: '#EAF3FE',
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  detailIconText: {
    color: '#2C7BE5',
    fontSize: 14,
    fontWeight: '900',
  },
  detailCopy: {
    flex: 1,
  },
  detailLabel: {
    color: '#8492A6',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  detailValue: {
    color: '#1B314C',
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    backgroundColor: '#E9EEF5',
    height: 1,
    marginLeft: 44,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2C7BE5',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 9,
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  notFoundIcon: {
    color: '#9AACBF',
    fontSize: 44,
  },
  notFoundTitle: {
    color: '#1B314C',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 8,
  },
  notFoundText: {
    color: '#75849A',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
    marginTop: 6,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
