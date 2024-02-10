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
                + '&type=recycle center'
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
                let results = data.results.slice(0, 5); // Get the top 5 results
                let carousel = document.createElement('div');
            carousel.className = 'carousel';
            results.forEach(result => {
                let slide = document.createElement('div');
                slide.className = 'slide';
                let img = document.createElement('img');
                img.src = result.photos[0].photo_reference; // You'll need to get the actual image URL
                slide.appendChild(img);
                let info = document.createElement('div');
                info.className = 'info';
                info.innerHTML = `
                    <h2>${result.name}</h2>
                    <p>${result.vicinity}</p>
                    <p>${result.opening_hours ? (result.opening_hours.open_now ? 'Open now' : 'Closed') : 'Hours not available'}</p>
                    <p>Rating: ${result.rating}</p>
                `;
                slide.appendChild(info);
                carousel.appendChild(slide);
            });
            document.body.appendChild(carousel); // Add the carousel to the body
        } else {
            throw new Error('Failed to get nearby restaurants');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}