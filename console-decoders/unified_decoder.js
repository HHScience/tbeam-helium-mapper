// Decoder for MaxPlastix mappers
//
// 11 Byte payload: 
// 3 Lat, 3 Long, 2 Altitude (m), 1 Speed (km/hr), 1 Battery, 1 Sats.
// Accuracy is a dummy value required by some Integrations.
// Battery is 1/100 of a volt, offset by 2v for a range of 2.00 to 4.56 volts.
//
function Decoder(bytes, port) {
  var decoded = {};

  // All formats carry a lat & lon reading:
  var latitude = ((bytes[0] << 16) >>> 0) + ((bytes[1] << 8) >>> 0) + bytes[2];
  latitude = (latitude / 16777215.0 * 180) - 90;

  var longitude = ((bytes[3] << 16) >>> 0) + ((bytes[4] << 8) >>> 0) + bytes[5];
  longitude = (longitude / 16777215.0 * 360) - 180;

  switch (port) {
    case 2: // Mapper! (Cargo and Heatmap too)
      decoded.latitude = latitude;
      decoded.longitude = longitude;

      decoded.altitude = bytes[6];
    
      decoded.location = latitude + ", " + longitude

      decoded.speed = parseFloat((((bytes[7])) / 1.609).toFixed(2));
      decoded.battery = parseFloat((bytes[8] / 100 + 2).toFixed(2));
      decoded.sats = bytes[9];
      decoded.uptime = bytes[10];
      decoded.accuracy = 2.5; // Bogus Accuracy required by Cargo/Mapper integration
      decoded.status = "TRANSMITTING GPS"
      break;
    case 5: // System status
      decoded.last_latitude = latitude;
      decoded.last_longitude = longitude;
      decoded.battery = parseFloat((bytes[6] / 100 + 2).toFixed(2));
      decoded.uptime = bytes[8];
      switch (bytes[7]) {
        case 1:
          decoded.status = "BOOT";
          break;
      }
      break;
    case 6: // Lost GPS
      decoded.last_latitude = latitude;
      decoded.last_longitude = longitude;
      decoded.battery = parseFloat((bytes[6] / 100 + 2).toFixed(2));
      decoded.sats = bytes[7];
      decoded.uptime = bytes[8];
      decoded.minutes = bytes[9];
      decoded.status = "LOST GPS"
      break;
  }

  return decoded;
}