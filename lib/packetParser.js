// lib/packetParser.js
// parse 10-byte binary packet
// 2b uint (id) + 4b float32 (lat) + 4b float32 (lng)
export function parseBinaryPacket(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength !== 10) {
    throw new Error(`Invalid packet size. Expected 10 bytes, received ${arrayBuffer ? arrayBuffer.byteLength : 0} bytes.`);
  }

  const view = new DataView(arrayBuffer);

  // parse big-endian
  const rawId = view.getUint16(0, false);
  const lat = view.getFloat32(2, false);
  const lng = view.getFloat32(6, false);
  
  // unpack event id: upper 4 bits category, lower 12 bits id
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
