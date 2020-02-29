let loginButton = document.querySelector('.login-button');
const loginUrl = 'http://127.0.0.1:8000/api-token-auth/';
let failWindow = document.querySelector('.on-fail-login');

document.querySelectorAll('input').forEach(function (x) {
    x.addEventListener('click', function (event) {
        event.preventDefault();

        failWindow.style.display = 'none';
    })
});

loginButton.addEventListener('click', function (event) {
    event.preventDefault();

    let email = document.querySelector('#inputEmail').value;
    let password = document.querySelector('#inputPassword').value;

    loginButton.innerHTML = `<img src="../icons/Rolling-0.4s-217px.svg" alt="Loading . . ." width="50" height="30">`;
    postLogin(email, password)
        .then(function (data) {
            if (data['status'] === 'success') {
                document.cookie = data['data']['token'];
                location.href = 'views/welcome.html?id=' + data['data']['user_id'];
            } else {
                failWindow.style.display = 'block';
            }
            loginButton.innerHTML = 'Sign in';
        });
});

function postLogin(email, password) {
    return fetch(loginUrl, {
        accept: 'application/json',
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password
        }),
    })
        .then(response => response.json())
}
