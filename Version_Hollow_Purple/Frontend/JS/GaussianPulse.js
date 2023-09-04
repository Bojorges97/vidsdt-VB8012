var websocket = new WebSocket("ws://192.168.0.129:80/");

let data = {};

function sendmsg(steps){
    steps.forEach(element =>data[element.name]=element.valueAsNumber);
    console.log(data);
    websocket.send(JSON.stringify(data));
}