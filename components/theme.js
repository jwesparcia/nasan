/**
 * Shared visual tokens for the NASAN prototype.  Keeping the palette here
 * makes the passenger and driver experiences feel like the same app.
 */
export const colors = {
  navy: '#0B2E59',
  navyDark: '#071F3D',
  blue: '#1B74D1',
  sky: '#EAF4FF',
  skyStrong: '#CFE7FF',
  background: '#F5F8FC',
  surface: '#FFFFFF',
  border: '#E2EAF3',
  text: '#14213D',
  muted: '#61718A',
  success: '#168A58',
  successSoft: '#E5F6EE',
  warning: '#B76A09',
  warningSoft: '#FFF3DC',
  danger: '#C83B4D',
  dangerSoft: '#FDEBED',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#183B66',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: '#061B36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 6,
  },
};

/**
 * A single source for the visual state used by cards, markers, and details.
 * `isAvailable` is the driver-controlled service toggle; a zero-seat bus is
 * still in service, but is shown as Full to passengers.
 */
export const getBusStatusMeta = (bus = {}) => {
  const availableSeats = Number(bus.availableSeats) || 0;

  if (bus.isAvailable === false) {
    return {
      label: 'Not Available',
      color: colors.danger,
      backgroundColor: colors.dangerSoft,
    };
  }

  if (availableSeats <= 0 || bus.status === 'Full') {
    return {
      label: 'Full',
      color: colors.danger,
      backgroundColor: colors.dangerSoft,
    };
  }

  if (bus.status === 'Arriving') {
    return {
      label: 'Arriving',
      color: colors.success,
      backgroundColor: colors.successSoft,
    };
  }

  return {
    label: bus.status || 'Available',
    color: colors.blue,
    backgroundColor: colors.sky,
  };
};
