console.log("David was Here");
console.log("Version Hollow_purple");

let ip_address = window.location.hostname;
let webSocket = new WebSocket("ws://" + ip_address + ":1025/");
let data = {};

const Status = document.getElementById('id_status'),
      TimePlot = document.querySelector("#timePlot"),
      FrecPlot = document.querySelector("#frecuencyPlot");



webSocket.onopen = function(frame) {
    Status.innerText = "Conectado a " + ip_address + ":5500";
};

webSocket.onclose = function(frame) {
    Status.innerText = "Socket desconectado";
};

webSocket.onmessage = function(info) {
    let data = JSON.parse(info.data);
    console.log(data)
    if (data["fGen"]){
        
        Plotly.newPlot( TimePlot, [{
        x: data["fGen"]["t"],
        y: data["fGen"]["timeY"]}], {
            margin: { t: 0 },
            title:{
                text:'Señal en el tiempo',
                x: 0.5,
                automargin: true,
                font: {
                  family: "Arial",
                  size: 15,
                  color: 'black'
                }
              },  
            width: 800,
            height: 250,
            xaxis: { 
                title: {
                  text: 't [s]',
                  font: {
                    family: "Arial",
                    size: 15,
                    color: 'black'
                  },
                },
                position: 0.3
                
              },
              yaxis: {
                title: {
                    family: "Arial",
                    text: 'f(t) [V]',
                    font: {
                      size: 15,
                      color: 'black'
                    }
                  }
              }} );

        Plotly.newPlot( FrecPlot, [{
            x: data["fGen"]["w"],
            y: data["fGen"]["frecY"]}
            ], {
            margin: { t: 0 },
            title:{
                text:'Señal en la frecuencia',
                x: 0.5,
                automargin: true,
                font: {
                  family: "Arial",
                  size: 15,
                  color: 'black'
                }    
            },  
            width: 800,
            height: 250,
            xaxis: { 
                title: {
                  text: 'w [Hz]',
                  font: {
                    family: "Arial",
                    size: 15,
                    color: 'black'
                  }
                },
                position: 0.3
              },
              yaxis: {
                title: {
                    text: 'f(w) [V]',
                    font: {
                      family: "Arial",
                      size: 15,
                      color: 'black'
                    }
                  },
              }
            } );
    }

}

function sendmsg(inputs, button){
    inputs.forEach(element =>data[element.name]=element.valueAsNumber);
    data['button'] = button.className
    console.log(data);
    webSocket.send(JSON.stringify(data));
}

