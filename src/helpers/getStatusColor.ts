const colors = {
  "0": "grey",
  "200": "green",
  "300": "yellow",
  "400": "red",
  "500": "red",
} as { [key: string]: string };

export const getStatusColor = (status: number = 0): string => {
  const statusCode = String(Math.floor(status / 100) * 100);
  return colors[statusCode] || colors["0"];
};
