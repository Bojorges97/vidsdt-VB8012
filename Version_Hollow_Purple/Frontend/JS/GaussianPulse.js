console.log("David was Here");
console.log("Version Hollow_purple");

let ip_address = window.location.hostname;
let webSocket = new WebSocket("ws://" + ip_address + ":1025/");
let data = {};

const Status = document.getElementById('id_status'),
      TimePlot = document.querySelector("#timePlot"),
      FrecPlot = document.querySelector("#frecuencyPlot");



webSocket.onopen = function(frame) {
    Status.innerText = "Connected to " + ip_address + ":8080";
};

webSocket.onclose = function(frame) {
    Status.innerText = "Socket disconnected";
};

webSocket.onmessage = function(info) {
    let data = JSON.parse(info.data);
    console.log(data)
    if (data["fGen"]){
        
        Plotly.newPlot( TimePlot, [{
        x: data["fGen"]["t"],
        y: data["fGen"]["timeY"]}], {
        margin: { t: 0 } } );

        Plotly.newPlot( FrecPlot, [{
            x: data["fGen"]["w"],
            y: data["fGen"]["frecY"]}], {
            margin: { w: 0 } } );
    }

}

function sendmsg(inputs, button){
    inputs.forEach(element =>data[element.name]=element.valueAsNumber);
    data['button'] = button.className
    console.log(data);
    webSocket.send(JSON.stringify(data));
}

