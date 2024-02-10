const API_KEY = 'AIzaSyAF3gR0NJ7LexQhxJIL_H9QA-qmcLzeqi4'
const geo_url = 'https://maps.googleapis.com/maps/api/geocode/json?'

function getGeoCoord(event) {
    event.preventDefault();
    let address = document.getElementById('address').value;
    let requestUrl = geo_url + 'key='+ API_KEY + '&address=' + encodeURIComponent(address);
    fetch(requestUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                let location = data.results[0].geometry.location;
                console.log(data);
                document.getElementById('latitude').value = location.lat;
                document.getElementById('longitude').value = location.lng;

                console.log('latitude: ' + document.getElementById('latitude').value);
                console.log('longitude: ' + document.getElementById('longitude').value);

                let nearbySearches = 'https://corsproxy.io/?https://maps.googleapis.com/maps/api/place/nearbysearch/json'
                + `?location=${encodeURIComponent(location.lat + ',' + location.lng)}`
                + '&radius=1500'
                + '&type=restaurant'
                + '&key=' + API_KEY;
                // return fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=1500&keyword=recycling%20center&key=${API_KEY}`);
                return fetch(nearbySearches, {
                    method: 'GET',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                })
                .then(response => {
                    if (response.ok) {
                        return response;
                    } else {
                        console.error(response);
                        throw new Error('Failed to get location');
                    }
                });
            } else {
                throw new Error('Failed to get location');
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                console.log(data.results); // This will log the nearby recycling centers
            } else {
                throw new Error('Failed to get nearby recycling centers');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}