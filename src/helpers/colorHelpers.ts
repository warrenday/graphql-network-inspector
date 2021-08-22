const colors = {
  inert: "#6B7280",
  success: "#10B981",
  warn: "#FBBF24",
  danger: "#DC2626",
};

const statusColors: Record<string, string> = {
  "0": colors.inert,
  "200": colors.success,
  "300": colors.warn,
  "400": colors.danger,
  "500": colors.danger,
};

export const getStatusColor = (status: number = 0): string => {
  const statusCode = String(Math.floor(status / 100) * 100);
  return statusColors[statusCode] || statusColors["0"];
};

export const getErrorCountColor = (count: number | undefined) => {
  switch (count) {
    case 0:
      return colors.success;
    case undefined:
      return colors.inert;
    default:
      return colors.danger;
  }
};
