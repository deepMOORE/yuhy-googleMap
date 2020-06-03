let serverUrl = `http://127.0.0.1:8000`;
let accessToken = getCookie('access_token');
let userId = (new URL(window.location.href)).searchParams.get('id');

document.querySelector('body > div > div.title > button')
    .addEventListener('click', function (event) {
        event.preventDefault();

        location.href = 'http://localhost:3000';
    });

function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {
            lat: 54.1973332,
            lng: 45.1052696
        }
    });

    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
    });

    function placeMarker(coordinates) {
        fetch(`${serverUrl}/events/create-event/`, {
            accept: 'application/json',
            method: 'POST',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${accessToken}`
            },
            body: JSON.stringify({
                name: 'AfterClickEvent',
                description: 'EventDesc',
                event_date: new Date(),
                latitude: coordinates.lat().toPrecision(7),
                longitude: coordinates.lng().toPrecision(7),
            }),
        })
            .then(
                () => location.reload()
            );

        let marker = new google.maps.Marker({
            position: coordinates,
            map: map
        });
    }

    document.querySelector('.add-event-button').addEventListener('click', function (x) {
        x.preventDefault();
        fetch(`${serverUrl}/events/create-event/`, {
            accept: 'application/json',
            method: 'POST',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${accessToken}`
            },
            body: JSON.stringify({
                name: 'MockName',
                description: 'MockDesc',
                event_date: new Date(),
                latitude: getRandomInt(100),
                longitude: getRandomInt(100),
            }),
        })
            .then(
                () => location.reload()
            );
    });

    fetch(`${serverUrl}/user/get-by-id/${userId}`, {
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${accessToken}`
        }
    })
        .then((response) => response.json())
        .then(
            (response) => {
                fillPageByUserInfo(response['data'].user);
                fetch(`${serverUrl}/events/get-list`,{
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `JWT ${accessToken}`
                    }
                })
                    .then(response => response.json())
                    .then(response => {
                        fillEventsList(response['data'], map)
                    })
            }
        );
}

function fillEventsList(events, map) {
    let eventsBox = document.querySelector('.event-box');
    events.forEach(x => {
        const marker = new google.maps.Marker({
            position: {lat: (parseFloat(x[2])), lng: (parseFloat(x[3]))},
            map: map,
        });

        marker.addListener('click', function() {
            fetch(`${serverUrl}/users/get-users-by-event-id/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${accessToken}`
                },
                body: JSON.stringify({
                    id: x[0],
                })
            })
                .then(response => response.json())
                .then(response => {
                    let names = response.data.map(x => {

                    });
                    let contentString = `<div id="content">
                                           ${x[1]}
                                           <hr>
                                           ${(response.data.length === 0)? "No users yet.":response.data}
                                         </div>`;
                    let infoWindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    infoWindow.open(map, marker);
                });
        });

        let eventNode = document.createElement('div');
        eventNode.className = 'event';
        eventNode.innerHTML = `<div class="event-info-bar">
                    <h3 class="event-title">${x[1]}</h3>
                    <span class="event-description">${x[4]}</span>
                </div>
                <button class="btn btn-danger take-part" data-id='${x[0]}'>Take part!</button>`;

        eventsBox.appendChild(eventNode);
    });

    setTimeout(setListeners, 2000);
}

function setListeners() {
    document.querySelectorAll('.take-part').forEach(function (x) {
        x.addEventListener('click', function (event) {
            let eventId = x.dataset.id;

            fetch(`${serverUrl}/events/register-user/`, {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${accessToken}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    event_id: eventId
                })
            })
                .then(response => response.json());

            event.preventDefault();
        });
    });
}

function  fillPageByUserInfo(user) {
    document.querySelector('.you-logged-as').innerHTML = 'You logged as ' + user.username;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : null;
}
