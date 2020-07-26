// This client side js file will be used by client to connect with socket.io
const socket = io();
// Elements
const $messageForm = document.querySelector("#sendMessageForm");
const $formInputButton = document.querySelector("button");
const $shareLocationButton = document.querySelector("#share-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#members-sidebar").innerHTML;

// query string
const queryString = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const containerHeight = $messages.scrollHeight;
  const scrollOffset = $messages.scrollTop + $messages.offsetHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (messageObject) => {
  const html = Mustache.render(messageTemplate, {
    message: messageObject.message,
    createdAt: moment(messageObject.createdAt).format("dddd - hh:mm A"),
    username: messageObject.username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("shareLocation", (location) => {
  const html = Mustache.render(locationTemplate, {
    locationUrl: location.locationUrl,
    createdAt: moment(location.createdAt).format("dddd - hh:mm A"),
    username: location.username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomMembers", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  $formInputButton.setAttribute("disabled", "disabled");
  const userMessage = event.target.elements.userMessage.value;
  socket.emit("sendMessage", userMessage, () => {
    $formInputButton.removeAttribute("disabled");
    event.target.elements.userMessage.value = "";
    console.log("Your message has been sent!");
  });
});

$shareLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  $shareLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "shareLocation",
      position.coords.latitude,
      position.coords.longitude,
      (acknowledgement) => {
        alert(acknowledgement);
        $shareLocationButton.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", queryString, (error) => {
  if (error) {
    location.href = "/";
    alert(error);
  }
});
