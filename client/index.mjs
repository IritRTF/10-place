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
  ws.addEventListener("message",(message)=>{
    let mes = JSON.parse(message.data);
    if (mes.type === 'update Place'){
      drawer.putArray(mes.payload.place)
    }
    else if(mes.type === 'click'){
      console.log(mes);
      drawer.put(mes.payload.x,mes.payload.y,mes.payload.color);
    }
  });

  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    ws.send(JSON.stringify({type:'click',payload:{x:x,y:y,color:picker.color}}));
  };
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
