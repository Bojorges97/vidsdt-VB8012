console.log("David was Here");
console.log("Version Hollow_purple");

let ip_address = window.location.hostname;
let data = {}, webSocket = new WebSocket("ws://" + ip_address + ":1025/");;

let today = new Date();
let expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days
let labels = ['amplitude', 'frecuency', 'nSamples', 'fs', 'hgw']

labels.forEach(element => {element != getCookie(element) ? document.querySelector('#'+element).value = getCookie(element) : {} ;})

const Status = document.getElementById('id_status'),
      TimePlotInput = document.querySelector("#timePlotIn"),
      FrecPlotInput = document.querySelector("#frecuencyPlotIn");


webSocket.onopen = function(frame) {
    Status.innerText = "Conectado a " + ip_address + ":5500";
};

webSocket.onclose = function(frame) {
    Status.innerText = "Socket desconectado";
    setTimeout(function() {
      connect();
    }, 2000);
};


webSocket.onmessage = function (info) {
    let backData = JSON.parse(info.data);
    console.log(backData)
    if(backData['connectDev']){
      document.querySelector('tr.gen-buttons').style.display = ''; 
    } else {
      document.querySelector('tr.gen-buttons').style.display = 'none'; 
      document.querySelector('#timePlotIn').innerHTML = ''; 
      document.querySelector('#frecuencyPlotIn').innerHTML = ''; 
    }
    if (backData["fGen"]){
        document.querySelector('#reloadButton').style.display = ''; 
        Plotly.newPlot( TimePlotInput, [{
        x: backData["fGen"]["t"],
        y: backData["fGen"]["timeY"]}], {
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

        Plotly.newPlot( FrecPlotInput, [{
            x: backData["fGen"]["w"],
            y: backData["fGen"]["frecY"]}
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
    if (backData["fmso"]){
      Plotly.newPlot( 'timePlotOut', [{
          x: backData["fmso"]["t"],
          y: backData["fmso"]["timeY"]}], {
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
    
      Plotly.newPlot( 'frecuencyPlotOut', [{
          x: backData["fmso"]["w"],
          y: backData["fmso"]["frecY"]}
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
    if(backData['average']){
      console.log(backData['average'])
      Plotly.newPlot( 'timePlotAverage', [{
        x: backData["average"]["t"],
        y: backData["average"]["timeY"]}], {
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
    }

};

function saveFile(input, event){
    window.some = event
    alert("Aún no lo codeo XD "+input.value)
}


function sendmsg(inputs, button){
    inputs.forEach(element => {
      element.name != 'model'? data[element.name] = element.valueAsNumber : data[element.name] = element.value;
      setCokie(element.name, element.value)
    });
    data['button'] = button
    console.log(data);
    webSocket.send(JSON.stringify(data));
}

function setCokie(name, value) {
  document.cookie = name + "=" + value + "; path=/; expires=" + expiry.toGMTString();
};

function getCookie(cname)
{
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name)==0) {
      return c.substring(name.length,c.length);
    }
  }
  return "";
}

// function connect(){
//   webSocket = new WebSocket("ws://" + ip_address + ":1025/");
// }

// // var intervalWs = setInterval(function (){
// //                     connect();
// //                   }, 1000)

// connect();