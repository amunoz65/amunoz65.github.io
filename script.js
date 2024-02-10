const API_KEY = 'AIzaSyAF3gR0NJ7LexQhxJIL_H9QA-qmcLzeqi4'
const geo_url = 'https://maps.googleapis.com/maps/api/geocode/json?'

function getGeoCoord(event) {
    event.preventDefault();

    let existingCarousel = document.querySelector('.carousel');
    if (existingCarousel) {
        document.body.removeChild(existingCarousel);
    }

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

                let slides = [];
                results.forEach((result,index) => {
                    let slide = document.createElement('div');
                    slide.className = 'slide' + (index === 0 ? ' active' : '');
                    let img = document.createElement('img');
                    img.src = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${result.photos[0].photo_reference}&key=${API_KEY}`;
                
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
                    slides.push(slide);
                    carousel.appendChild(slide);
                });

                let leftArrow = document.createElement('button');
                leftArrow.className = 'arrow left';
                leftArrow.textContent = '<';

                leftArrow.addEventListener('click', () => {
                    let index = slides.findIndex(slide => slide.classList.contains('active'));
                    slides[index].classList.remove('active');
                    slides[(index - 1 + slides.length) % slides.length].classList.add('active');
                });    
                carousel.appendChild(leftArrow);
                  
                let rightArrow = document.createElement('button');
                rightArrow.className = 'arrow right';
                rightArrow.textContent = '>';

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