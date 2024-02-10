const API_KEY = 'AIzaSyAF3gR0NJ7LexQhxJIL_H9QA-qmcLzeqi4'

// Base URL for the Google Geocoding API
const geo_url = 'https://maps.googleapis.com/maps/api/geocode/json?'

function getGeoCoord(event) {
    event.preventDefault();

    //Check if there is an existing carousel and remove it
    let existingCarousel = document.querySelector('.carousel');
    if (existingCarousel) {
        document.body.removeChild(existingCarousel);
    }

    // Get the user inputted address
    let address = document.getElementById('address').value;
    let requestUrl = geo_url + 'key='+ API_KEY + '&address=' + encodeURIComponent(address);

    // Fetch the location of the user inputted address
    fetch(requestUrl)
        .then(response => response.json())
        .then(data => {

            // If the status is OK, then the location was found
            if (data.status === 'OK') {

                // Get the latitude and longitude of the location
                let location = data.results[0].geometry.location;
                console.log(data);
                document.getElementById('latitude').value = location.lat;
                document.getElementById('longitude').value = location.lng;

                // Use the latitude and longitude to find nearby recycling centers using the Places API
                let nearbySearches = 'https://corsproxy.io/?https://maps.googleapis.com/maps/api/place/nearbysearch/json'
                + `?location=${encodeURIComponent(location.lat + ',' + location.lng)}`
                + '&radius=1500'
                + '&type=recycle center'
                + '&key=' + API_KEY;

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
            // If the status is OK, then the nearby recycling centers were found. A carousel will be created to display the top 5 results
            if (data.status === 'OK') {
                // Get the top 5 results from our JSON data
                let results = data.results.slice(0, 5); // Get the top 5 results
                
                // Create a carousel to display the top 5 results
                let carousel = document.createElement('div');
                carousel.className = 'carousel';

                // Create a slide for each result that contains an image and information about the recycling center
                let slides = [];
                results.forEach((result,index) => {
                    let slide = document.createElement('div');
                    slide.className = 'slide' + (index === 0 ? ' active' : '');
                    let img = document.createElement('img');

                    // If there is a photo, display it. Otherwise, display a default image
                    img.src = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${result.photos[0].photo_reference}&key=${API_KEY}`;
                
                    slide.appendChild(img);
                    let info = document.createElement('div');
                    info.className = 'info';

                    // Display the name, address, open hours, and rating of the recycling center
                    info.innerHTML = `
                        <h2>${result.name}</h2>
                        <p>${result.vicinity}</p>
                        <p>${result.opening_hours ? (result.opening_hours.open_now ? 'Open now' : 'Closed') : 'Hours not available'}</p>
                        <p>Rating: ${result.rating}</p>
                    `;
                    slide.appendChild(info);
                    slides.push(slide);
                    carousel.appendChild(slide);
                });

                // Add a left arrow to scroll left through the slides
                let leftArrow = document.createElement('button');
                leftArrow.className = 'arrow left';
                leftArrow.textContent = '<';

                // When the left arrow is clicked, the active slide will be removed and the previous slide will be added
                leftArrow.addEventListener('click', () => {
                    let index = slides.findIndex(slide => slide.classList.contains('active'));
                    slides[index].classList.remove('active');
                    slides[(index - 1 + slides.length) % slides.length].classList.add('active');
                });    
                carousel.appendChild(leftArrow);

                // Add a right arrow to scroll right through the slides  
                let rightArrow = document.createElement('button');
                rightArrow.className = 'arrow right';
                rightArrow.textContent = '>';

                // When the right arrow is clicked, the active slide will be removed and the next slide will be added
                rightArrow.addEventListener('click', () => {
                    let index = slides.findIndex(slide => slide.classList.contains('active'));
                    slides[index].classList.remove('active');
                    slides[(index + 1) % slides.length].classList.add('active');
                });

                carousel.appendChild(rightArrow);
                document.body.appendChild(carousel); // Add the carousel to the body        
        } else {
            throw new Error('Failed to get nearby reycling centers');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}