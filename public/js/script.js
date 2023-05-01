// Add event listeners for the login and registration forms
const github = "https://github.com/ctf2023techteam/hackwarts.git"

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/login');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
      if (xhr.status === 200) {
        const token = document.cookie.match(/(^| )token=([^;]+)/)[2];
        const decoded = jwt_decode(token);
        window.location.href = '/welcome';
      } else {
        alert(xhr.response);
      }
    };
    xhr.send(JSON.stringify({ username, password }));
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/register');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
      if (xhr.status === 200) {
        window.location.href = '/login';
      } else {
        alert(xhr.response);
      }
    };
    xhr.send(JSON.stringify({ username, password }));
  });
}

// Add event listener for the logout button
const logoutButton = document.getElementById('logout-button');

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/logout');
    xhr.onload = () => {
      if (xhr.status === 200) {
        window.location.href = '/login';
      } else {
        alert(xhr.response);
      }
    };
    xhr.send();
  });
}
