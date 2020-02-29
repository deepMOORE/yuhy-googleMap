let serverUrl = `http://127.0.0.1:8000`;

function initMap() {
    var uluru = {lat: 54.1973332, lng: 45.1052696};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {
            lat: 54.1973332,
            lng: 45.1052696
        }
    });

    document.querySelector('.add-event-button').addEventListener('click', function (x) {
        x.preventDefault();
        fetch(`${serverUrl}/events/create-event/`, {
            accept: 'application/json',
            method: 'POST',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'MockName',
                description: 'MockDesc',
                event_date: new Date(),
                latitude: getRandomInt(100),
                longitude: getRandomInt(100),
            }),
        })
            .then(response => response.json())
            .then(data => console.info(data))
    });

    let url = new URL(window.location.href);
    let userId = url.searchParams.get('id');
    fetch(`${serverUrl}/user/get-by-id/${userId}`, {
        cache: 'no-cache',
    })
        .then((response) => response.json())
        .then(
            (response) => {
                fillPageByUserInfo(response['data'].user);
                fetch(`${serverUrl}/events/get-list`,{
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `JWT ${getCookie('access_token')}`
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
            position: {lat: (parseFloat(x.latitude)), lng: (parseFloat(x.longitude))},
            map: map,
        });

        let eventNode = document.createElement('div');
        eventNode.className = 'event';
        eventNode.innerHTML = `<div class="event-info-bar">
                    <h3 class="event-title">${x.name}</h3>
                    <span class="event-description">${x.description}</span>
                </div>
                <button class="btn btn-danger take-part" data-id='${x.id}'>Take part!</button>`;

        eventsBox.appendChild(eventNode);
    });

    setTimeout(setListeners, 2000);
}

function setListeners() {
    document.querySelectorAll('.take-part').forEach(function (x) {
        x.addEventListener('click', function (event) {
            // console.log(event.target);
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
