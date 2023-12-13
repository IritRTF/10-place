import timeout from "./timeout.mjs";
import drawer from "./drawer.mjs";
import picker from "./picker.mjs";

document.querySelector("#start").addEventListener("submit", e => {
  e.preventDefault();
  main(new FormData(e.currentTarget).get("apiKey"));
  document.querySelector(".container").classList.add("ready");
});

const main = apiKey => {
  const ws = connect(apiKey);
  ws.addEventListener("message",  (message) =>{
    let action = JSON.parse(message.data);
    if(action.type ==="place") {
      drawer.putArray(action.payload.place)
    }
    else if (action.type ="click"){
      drawer.put(action.payload.x, action.payload.y, action.payload.color)
    }
  });

  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    drawer.put(x, y, picker.color);
  };
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
