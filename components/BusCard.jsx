import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  getBusStatusMeta,
  radius,
  shadows,
  spacing,
} from './theme';

/**
 * Passenger-facing summary of a bus. The component reads only from `bus`, so
 * it automatically reflects the in-memory updates supplied by BusContext.
 */
export default function BusCard({
  bus,
  onPress,
  compact = false,
  showDriver = false,
  style,
  testID,
}) {
  if (!bus) return null;

  const availableSeats = Math.max(0, Number(bus.availableSeats) || 0);
  const totalSeats = Math.max(1, Number(bus.totalSeats) || 1);
  const status = getBusStatusMeta(bus);
  const availabilityRatio = Math.min(availableSeats / totalSeats, 1);

  return (
    <Pressable
      accessibilityHint={onPress ? 'Opens bus details' : undefined}
      accessibilityLabel={`${bus.busNumber}, ${status.label}, ${availableSeats} of ${totalSeats} seats available`}
      accessibilityRole={onPress ? 'button' : undefined}
      android_ripple={{ color: colors.sky }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && onPress && styles.cardPressed,
        style,
      ]}
      testID={testID}
    >
      <View style={styles.topRow}>
        <View style={styles.busIdentity}>
          <View style={[styles.busIcon, { backgroundColor: status.backgroundColor }]}>
            <Ionicons color={status.color} name="bus-outline" size={22} />
          </View>
          <View style={styles.identityText}>
            <Text numberOfLines={1} style={styles.busNumber}>
              {bus.busNumber}
            </Text>
            <Text numberOfLines={1} style={styles.route}>
              {bus.route}
            </Text>
          </View>
        </View>

        {bus.eta ? (
          <View style={styles.etaPill}>
            <Ionicons color={colors.navy} name="time-outline" size={14} />
            <Text style={styles.etaText}>{bus.eta}</Text>
          </View>
        ) : null}
      </View>

      {showDriver && bus.driverName ? (
        <Text style={styles.driverText}>Driver: {bus.driverName}</Text>
      ) : null}

      <View style={[styles.statusPill, { backgroundColor: status.backgroundColor }]}>
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>

      {!compact ? (
        <View style={styles.seatSection}>
          <View style={styles.seatHeading}>
            <Text style={styles.seatLabel}>Available seats</Text>
            <Text style={styles.seatValue}>
              {availableSeats} <Text style={styles.seatTotal}>/ {totalSeats}</Text>
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${availabilityRatio * 100}%`,
                  backgroundColor: status.color,
                },
              ]}
            />
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

export { BusCard };

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardCompact: {
    paddingVertical: spacing.md,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  busIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: spacing.sm,
    minWidth: 0,
  },
  busIcon: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  identityText: {
    flex: 1,
  },
  busNumber: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  route: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  etaPill: {
    alignItems: 'center',
    backgroundColor: colors.sky,
    borderRadius: radius.pill,
    flexDirection: 'row',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  etaText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  driverText: {
    color: colors.muted,
    fontSize: 12,
    marginLeft: 60,
    marginTop: spacing.sm,
  },
  statusPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    marginLeft: 60,
    marginTop: spacing.md,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusDot: {
    borderRadius: 4,
    height: 7,
    marginRight: 6,
    width: 7,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  seatSection: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  seatHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seatLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  seatValue: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  seatTotal: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 7,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.pill,
    height: '100%',
    minWidth: 0,
  },
});
