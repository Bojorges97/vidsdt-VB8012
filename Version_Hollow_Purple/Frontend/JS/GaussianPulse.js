var websocket = new WebSocket("ws://172.16.29.60:80/");

let data = {};

function sendmsg(steps){
    steps.forEach(element =>data[element.name]=element.valueAsNumber);
    console.log(data);
    websocket.send(JSON.stringify(data));
}