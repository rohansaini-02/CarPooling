 
const areas = [
    { "area": "Koramangala", "latitude": 12.9352, "longitude": 77.6245 },
    { "area": "Indiranagar", "latitude": 12.9716, "longitude": 77.6411 },
    { "area": "Whitefield", "latitude": 12.9698, "longitude": 77.7499 },
    { "area": "Jayanagar", "latitude": 12.9250, "longitude": 77.5938 },
    { "area": "Electronic City", "latitude": 12.8441, "longitude": 77.6452 },
    { "area": "Bangalore University", "latitude": 12.9462, "longitude": 77.5103 },
    { "area": "Gandhinagar", "latitude": 12.9791, "longitude": 77.5777 }
];


const fixedDistances = {
    "Koramangala-Jayanagar": 7.4,
    "Indiranagar-Electronic City": 19.6,
    "Whitefield-Gandhinagar": 14.5,
    "Jayanagar-Bangalore University": 4.9,
    "Electronic City-Gandhinagar": 22
};

const RATE_PER_KM = 15; 

// Function to get coordinates of an area
function getCoordinates(areaName) {
    if (!areaName) return null;
    const normalizedAreaName = areaName.trim().toLowerCase();
    const area = areas.find(a => a.area.toLowerCase() === normalizedAreaName);
    return area ? { latitude: area.latitude, longitude: area.longitude } : null;
}

//  calculate dist. b/w 2 coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Function to find rides and calculate charges
function findRides() {
    const source = document.getElementById('source').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const passengers = parseInt(document.getElementById('passengers').value, 10);

    if (!source || !destination || !passengers || passengers <= 0 || passengers > 4) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const fixedKey = `${source}-${destination}`;
    const reverseKey = `${destination}-${source}`;  
    let distance = fixedDistances[fixedKey] || fixedDistances[reverseKey];

    if (!distance) {
        const sourceCoordinates = getCoordinates(source);
        const destinationCoordinates = getCoordinates(destination);

        if (!sourceCoordinates || !destinationCoordinates) {
            alert(`Invalid source or destination area. Please check the names and try again.\nValid areas: ${areas.map(a => a.area).join(', ')}`);
            return;
        }

        distance = calculateDistance(
            sourceCoordinates.latitude,
            sourceCoordinates.longitude,
            destinationCoordinates.latitude,
            destinationCoordinates.longitude
        ).toFixed(2);
    }

    const charges = (distance * RATE_PER_KM).toFixed(2);

    const rideData = { source, destination, passengers, distance, charges };
    localStorage.setItem('rideSearch', JSON.stringify(rideData));

     
    if (!localStorage.getItem('availableRides')) {
        const availableRides = [
            { source: "Electronic City", destination: "Jayanagar", availableSeats: 3 },
            { source: "Koramangala", destination: "Indiranagar", availableSeats: 2 },
            { source: "Koramangala", destination: "Electronic City", availableSeats: 4 },
            { source: "Koramangala", destination: "Gandhinagar", availableSeats: 1 },
            { source: "Koramangala", destination: "Bangalore University", availableSeats: 3 },
            { source: "Indiranagar", destination: "Electronic City", availableSeats: 5 },
            { source: "Indiranagar", destination: "Jayanagar", availableSeats: 2 },
            { source: "Whitefield", destination: "Gandhinagar", availableSeats: 3 },
        ];
        localStorage.setItem('availableRides', JSON.stringify(availableRides));
    }

    window.location.href = 'available-rides.html';
}
 
function loadAvailableRides() {
    const rideSearch = JSON.parse(localStorage.getItem('rideSearch'));

    if (!rideSearch) {
        document.getElementById('ridesList').innerHTML = '<li>No search data found. Please go back and search again.</li>';
        return;
    }

    const { source, destination, passengers, distance, charges } = rideSearch;
    const availableRides = JSON.parse(localStorage.getItem('availableRides'));

    const filteredRides = availableRides.filter(
        ride =>
            ride.source.toLowerCase() === source.toLowerCase() &&
            ride.destination.toLowerCase() === destination.toLowerCase() &&
            ride.availableSeats >= passengers
    );

    const ridesList = document.getElementById('ridesList');
    ridesList.innerHTML = '';

    if (filteredRides.length > 0) {
        filteredRides.forEach(ride => {
            const listItem = document.createElement('li');
            listItem.textContent = `Source: ${ride.source}, Destination: ${ride.destination}, Seats Available: ${ride.availableSeats}`;
            ridesList.appendChild(listItem);

            
            ride.availableSeats -= passengers;   
        });



         
        localStorage.setItem('availableRides', JSON.stringify(availableRides));

        const distanceItem = document.createElement('li');
        distanceItem.textContent = `Distance between ${source} and ${destination}: ${distance} km`;
        ridesList.appendChild(distanceItem);
        const chargesItem = document.createElement('li');
        chargesItem.textContent = `Total charges for the ride: ₹${charges}`;
        ridesList.appendChild(chargesItem);
    } else {
        ridesList.innerHTML = '<li>No rides available for the given criteria.</li>';
    }
}

 
if (window.location.pathname.includes('available-rides.html')) {
    loadAvailableRides();
}
