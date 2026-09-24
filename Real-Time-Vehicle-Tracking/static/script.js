// ===============================
// Real-Time Vehicle Tracking
// ===============================

let latitude = 12.9716;
let longitude = 77.5946;

// -------------------------------
// Create Map
// -------------------------------

const map = L.map("map").setView(
    [latitude, longitude],
    15
);

// OpenStreetMap tiles
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// -------------------------------
// Create Vehicle Marker
// IMPORTANT: Create this BEFORE
// using vehicleMarker anywhere.
// -------------------------------

const vehicleMarker = L.marker(
    [latitude, longitude]
).addTo(map);

vehicleMarker.bindPopup(
    "<b>Vehicle VH001</b><br>Moving"
);


// -------------------------------
// Send Location to Flask
// -------------------------------

function sendLocation() {

    fetch("/api/location", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            vehicle_id: "VH001",
            latitude: latitude,
            longitude: longitude,
            speed: 42,
            status: "Moving"
        })

    })

    .then(response => response.json())

    .then(data => {
        console.log("Location saved:", data);
    })

    .catch(error => {
        console.error("Error sending location:", error);
    });
}


// -------------------------------
// Get Latest Location From Database
// -------------------------------

function getLatestLocation() {

    fetch("/api/location/latest")

        .then(response => response.json())

        .then(data => {

            if (data.message) {
                console.log(data.message);
                return;
            }

            console.log("Database location:", data);

            // Update marker
            vehicleMarker.setLatLng([
                data.latitude,
                data.longitude
            ]);

            // Move map
            map.panTo([
                data.latitude,
                data.longitude
            ]);

            // Update latitude
            const latitudeElement =
                document.getElementById("latitude");

            if (latitudeElement) {
                latitudeElement.innerText =
                    Number(data.latitude).toFixed(6);
            }

            // Update longitude
            const longitudeElement =
                document.getElementById("longitude");

            if (longitudeElement) {
                longitudeElement.innerText =
                    Number(data.longitude).toFixed(6);
            }

            // Update speed
            const speedElement =
                document.getElementById("speed");

            if (speedElement) {
                speedElement.innerText =
                    data.speed + " km/h";
            }
            const statusElement =
            document.getElementById("status");
            if (statusElement) {
                statusElement.innerText = data.status;
            }

        })

        .catch(error => {
            console.error(
                "Error getting location:",
                error
            );
        });
}


// -------------------------------
// Simulate Vehicle Movement
// -------------------------------

function updateVehicle() {

    latitude += 0.0002;
    longitude += 0.0002;

    // Move marker
    vehicleMarker.setLatLng([
        latitude,
        longitude
    ]);

    // Center map
    map.panTo([
        latitude,
        longitude
    ]);

    // Update dashboard
    const latitudeElement =
        document.getElementById("latitude");

    if (latitudeElement) {
        latitudeElement.innerText =
            latitude.toFixed(6);
    }

    const longitudeElement =
        document.getElementById("longitude");

    if (longitudeElement) {
        longitudeElement.innerText =
            longitude.toFixed(6);
    }

    const speedElement =
        document.getElementById("speed");

    if (speedElement) {
        speedElement.innerText =
            "42 km/h";
    }

    // Save to database
    sendLocation();
}


// -------------------------------
// Start Tracking
// -------------------------------

// Send initial location
sendLocation();

// Get database location
getLatestLocation();

// Update vehicle every 3 seconds
setInterval(updateVehicle, 3000);

// Read database every 3 seconds
setInterval(getLatestLocation, 3000);