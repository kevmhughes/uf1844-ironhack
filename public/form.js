const message = document.querySelector('#message');

if (message) {
    message.addEventListener('click', (event) => {
        event.target.style.display = 'none';
    })
}

const alreadyMessage = document.querySelector('#already-message');

if (alreadyMessage) {
    alreadyMessage.addEventListener('click', (event) => {
        event.target.style.display = 'none';
    })
}