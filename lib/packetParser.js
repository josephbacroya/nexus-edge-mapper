// lib/packetParser.js
/**
 * Parses a 10-byte binary packet containing:
 * - 2 bytes Unsigned Integer (Event ID)
 * - 4 bytes Float32 (Latitude)
 * - 4 bytes Float32 (Longitude)
 *
 * @param {ArrayBuffer} arrayBuffer - The raw binary buffer
 * @returns {Object} - Parsed JSON object
 */
export function parseBinaryPacket(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength !== 10) {
    throw new Error(`Invalid packet size. Expected 10 bytes, received ${arrayBuffer ? arrayBuffer.byteLength : 0} bytes.`);
  }

  const view = new DataView(arrayBuffer);

  // Parse according to Big-Endian network byte order (false = big-endian)
  const rawId = view.getUint16(0, false);
  const lat = view.getFloat32(2, false);
  const lng = view.getFloat32(6, false);
  
  // Unpack Event ID: Upper 4 bits = Category, Lower 12 bits = ID
  const categoryId = rawId >> 12;
  const eventId = rawId & 0xFFF;
  
  let categoryName = 'Other';
  if (categoryId === 1) categoryName = 'Wildfires';
  if (categoryId === 2) categoryName = 'Severe Storms';
  if (categoryId === 3) categoryName = 'Volcanoes';
  if (categoryId === 4) categoryName = 'Earthquakes';

  return {
    id: eventId,
    category: categoryName,
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    timestamp: new Date().toISOString(),
  };
}
