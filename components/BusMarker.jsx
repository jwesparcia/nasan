import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Callout, Marker } from './NasanMap';
import { Ionicons } from '@expo/vector-icons';
import { colors, getBusStatusMeta, radius, shadows } from './theme';

/**
 * Map marker for one mock bus. Place it directly inside a react-native-maps
 * MapView: <BusMarker bus={bus} onPress={...} />.
 */
export default function BusMarker({
  bus,
  onPress,
  selected = false,
  showCallout = true,
}) {
  const coordinates = bus?.coordinates || bus?.location;
  if (!bus || !coordinates?.latitude || !coordinates?.longitude) return null;

  const status = getBusStatusMeta(bus);
  const availableSeats = Math.max(0, Number(bus.availableSeats) || 0);
  const totalSeats = Math.max(1, Number(bus.totalSeats) || 1);

  return (
    <Marker
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={coordinates}
      identifier={String(bus.id || bus.busNumber)}
      onPress={onPress}
      zIndex={selected ? 2 : 1}
    >
      <View
        accessibilityLabel={`${bus.busNumber}, ${status.label}`}
        style={[
          styles.marker,
          selected && styles.markerSelected,
          { backgroundColor: status.color },
        ]}
      >
        <Ionicons color={colors.white} name="bus" size={18} />
      </View>

      {showCallout ? (
        <Callout tooltip>
          <View style={styles.callout}>
            <View style={styles.calloutTopRow}>
              <Text style={styles.calloutBusNumber}>{bus.busNumber}</Text>
              {bus.eta ? <Text style={styles.calloutEta}>{bus.eta}</Text> : null}
            </View>
            <Text numberOfLines={1} style={styles.calloutRoute}>
              {bus.route}
            </Text>
            <View style={styles.calloutStatusRow}>
              <View style={[styles.calloutStatusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.calloutStatus, { color: status.color }]}>
                {status.label}
              </Text>
              <Text style={styles.calloutSeats}>
                {availableSeats}/{totalSeats} seats
              </Text>
            </View>
          </View>
        </Callout>
      ) : null}
    </Marker>
  );
}

export { BusMarker };

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    borderColor: colors.white,
    borderRadius: 22,
    borderWidth: 3,
    height: 44,
    justifyContent: 'center',
    width: 44,
    ...shadows.floating,
  },
  markerSelected: {
    borderColor: colors.navy,
    transform: [{ scale: 1.14 }],
  },
  callout: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 205,
    padding: 12,
    ...shadows.floating,
  },
  calloutTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calloutBusNumber: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  calloutEta: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  calloutRoute: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  calloutStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 9,
  },
  calloutStatusDot: {
    borderRadius: 4,
    height: 7,
    marginRight: 5,
    width: 7,
  },
  calloutStatus: {
    fontSize: 11,
    fontWeight: '800',
  },
  calloutSeats: {
    color: colors.muted,
    fontSize: 11,
    marginLeft: 'auto',
  },
});
