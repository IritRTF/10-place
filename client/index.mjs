import timeout from "./timeout.mjs";
import drawer from "./drawer.mjs";
import picker from "./picker.mjs";
import { json } from "express";

document.querySelector("#start").addEventListener("submit", e => {
  e.preventDefault();
  main(new FormData(e.currentTarget).get("apiKey"));
  document.querySelector(".container").classList.add("ready");
});

const main = apiKey => {
  const ws = connect(apiKey);
  ws.addEventListener("message", (message) => {
    const dataJSON = JSON.parse(message.data);
    if (dataJSON.type === 'place') {
      drawer.putArray(dataJSON.payload.place)
    }
    else if (dataJSON.type === 'click') {
      drawer.put(dataJSON.payload.x, dataJSON.payload.y, dataJSON.payload.color)
    }
  });
  // (msg => {
  //   let colorsArr = JSON.parse(msg.data);
  //   console.log(colorsArr.payload.place);
  //   drawer.putArray(colorsArr.payload.place);
  // }));

  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    // drawer.put(x, y, picker.color);
    let msg = {
      type: "click",
      payload: {
        x: x,
        y: y,
        color: picker.color,
      }
    };
    ws.send(JSON.stringify(msg));
  };
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
