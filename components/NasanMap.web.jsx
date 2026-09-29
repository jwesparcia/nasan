import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * react-native-maps is a native module. This lightweight, static map preview
 * lets the rest of the prototype (and its shared driver/passenger state) run
 * in a browser too, while Android and iOS use NasanMap.native.jsx instead.
 */
const NasanMap = forwardRef(({ style, children }, ref) => {
  useImperativeHandle(ref, () => ({
    // The native MapView supports this method. Keeping a no-op equivalent
    // avoids platform checks in the screen-level location controls.
    animateToRegion: () => {},
  }));

  return (
    <View accessibilityLabel="Static map preview" style={[styles.map, style]}>
      <View style={styles.grid} />
      <View style={[styles.road, styles.roadOne]} />
      <View style={[styles.road, styles.roadTwo]} />
      <View style={styles.routeLine} />
      <View style={[styles.pin, styles.pinOne]} />
      <View style={[styles.pin, styles.pinTwo]} />
      <View style={styles.caption}>
        <Text style={styles.captionTitle}>General Trias routes</Text>
        <Text style={styles.captionText}>Interactive map available in the mobile app</Text>
      </View>
      {children}
    </View>
  );
});

// Screen markup can remain identical on web; actual markers and polylines are
// represented by the visual preview above instead of native map primitives.
export function Marker() {
  return null;
}

export function Polyline() {
  return null;
}

export function Callout() {
  return null;
}

export default NasanMap;

const styles = StyleSheet.create({
  map: {
    backgroundColor: '#DCEAF2',
    overflow: 'hidden',
    position: 'relative',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EAF2F5',
    opacity: 0.7,
  },
  road: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D0DDE5',
    borderWidth: 1,
    height: 35,
    opacity: 0.94,
    position: 'absolute',
    width: '130%',
  },
  roadOne: {
    left: '-15%',
    top: '30%',
    transform: [{ rotate: '-18deg' }],
  },
  roadTwo: {
    left: '-14%',
    top: '64%',
    transform: [{ rotate: '25deg' }],
  },
  routeLine: {
    backgroundColor: '#2C7BE5',
    borderRadius: 6,
    height: 6,
    left: '20%',
    position: 'absolute',
    top: '49%',
    transform: [{ rotate: '-12deg' }],
    width: '59%',
  },
  pin: {
    backgroundColor: '#168A58',
    borderColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 4,
    height: 28,
    position: 'absolute',
    shadowColor: '#173A5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    width: 28,
  },
  pinOne: {
    left: '25%',
    top: '35%',
  },
  pinTwo: {
    backgroundColor: '#0B5CAB',
    right: '23%',
    top: '55%',
  },
  caption: {
    backgroundColor: 'rgba(11, 46, 89, 0.9)',
    borderRadius: 12,
    bottom: 12,
    left: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
    position: 'absolute',
  },
  captionTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  captionText: {
    color: '#D6E7F7',
    fontSize: 9,
    marginTop: 2,
  },
});

