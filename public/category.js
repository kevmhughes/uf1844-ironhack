const message = document.querySelector("#category-message");

if (message) {
  message.addEventListener("click", (event) => {
    event.target.style.display = "none";
  });
}

const alreadyMessage = document.querySelector("#category-already-message");

if (alreadyMessage) {
  alreadyMessage.addEventListener("click", (event) => {
    event.target.style.display = "none";
  });
}
