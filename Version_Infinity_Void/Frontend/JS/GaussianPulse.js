
console.log("David was Here");
console.log("Version Infinity Void");

/**/////////////////////////////////////////////
//////////                      ////////////////
//////////  GLOBAL VARIABLES    ////////////////
//////////                      ////////////////
/////////////////////////////////////////////**/

let ip_address = window.location.hostname,
    webSocket,
    frontData = {},
    backData;

let today = new Date(),
    expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000), // Plus 30 days
    labels = ['amplitude', 'frecuency', 'nSamples', 'fs', 'hgw']; // Inputs for cookies

const Status = document.getElementById('id_status'),
      TimePlotInput = document.querySelector("#timePlotIn"),
      FrecPlotInput = document.querySelector("#frecuencyPlotIn");

/**/////////////////////////////////////////////
//////////                      ////////////////
//////////  STARTING ACTIONS    ////////////////
//////////                      ////////////////
/////////////////////////////////////////////**/

labels.forEach(element => {element != getCookie(element) ? document.querySelector('#'+element).value = getCookie(element) : {} ;})

connectWebSockets();

/**/////////////////////////////////////////////
//////////                       ///////////////
//////////  WEBSOCKET FUNCTIONS  ///////////////
//////////                       ///////////////
/////////////////////////////////////////////**/

webSocket.onopen = function() {
    Status.innerText = "Conectado a " + ip_address + ":5500";
};

webSocket.onclose = function() {
    Status.innerText = "Socket desconectado";
    setTimeout(function() {
      connectWebSockets();
    }, 2000);// Reconnect websocket after two seconds
};

webSocket.onmessage = function (info) {
    backData = JSON.parse(info.data);
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
      let TimePlotInput ={
          divId : 'timePlotIn', 
          dataX : backData["fGen"]["t"],
          dataY : backData["fGen"]["timeY"],
          title : 'Señal en el tiempo',
          axisX : 't [s]',
          axisY : 'f(t) [V]', 
      };
      createPlot(TimePlotInput);
      let FrecPlotInput ={
        divId : 'frecuencyPlotIn', 
        dataX : backData["fGen"]["w"],
        dataY : backData["fGen"]["frecY"],
        title : 'Señal en la frecuencia',
        axisX : 'w [Hz]',
        axisY : 'f(w) [V]',
      };
      createPlot(FrecPlotInput);
    }

    if (backData["fmso"]){
      let TimePlotOut ={
        divId : 'timePlotOut', 
        dataX : backData["fmso"]["t"],
        dataY : backData["fmso"]["timeY"],
        title : 'Señal en el tiempo',
        axisX : 't [s]',
        axisY : 'f(t) [V]', 
      };
      createPlot(TimePlotOut);
      let FrecPlotOut ={
        divId : 'frecuencyPlotOut', 
        dataX : backData["fmso"]["w"],
        dataY : backData["fmso"]["frecY"],
        title : 'Señal en la frecuencia',
        axisX : 'w [Hz]',
        axisY : 'f(w) [V]',
      };
      createPlot(FrecPlotOut);
    } 

    if(backData['average']){
      let timePlotAverage ={
        divId : 'timePlotAverage', 
        dataX : backData["average"]["t"],
        dataY : backData["average"]["timeY"],
        title : 'Señal en el tiempo',
        axisX : 't [s]',
        axisY : 'f(t) [V]', 
      };
      createPlot(timePlotAverage);
    }
};

function connectWebSockets(){
    webSocket = new WebSocket("ws://" + ip_address + ":1025/");
}

function sendmsg(button, inputs){
    frontData['button'] = button
    inputs.forEach(element => {
      element.name != 'model'? frontData[element.name] = element.valueAsNumber : frontData[element.name] = element.value;
      setCokie(element.name, element.value)
    });
    webSocket.send(JSON.stringify(frontData));
}

/**/////////////////////////////////////////////
//////////                       ///////////////
//////////   PLOTLY FUNCTIONS    ///////////////
//////////                       ///////////////
/////////////////////////////////////////////**/

function createPlot(featuresPlot){
    Plotly.newPlot( featuresPlot['divId'], [{
      x: featuresPlot['dataX'],
      y: featuresPlot['dataY']}], {
          margin: { t: 0 },
          title:{
              text:featuresPlot['title'],
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
                text: featuresPlot['AxisX'],
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
                  text: featuresPlot['AxisY'],
                  font: {
                    size: 15,
                    color: 'black'
                  }
                }
          }
      } 
    );
}
/**/////////////////////////////////////////////
//////////                       ///////////////
//////////  DOWNLOAD FUNCTIONS   ///////////////
//////////                       ///////////////
/////////////////////////////////////////////**/

function saveFile(name, type){
    const element = document.createElement('a');
    let file;

    console.log(backData)
    switch(type){
      case 'time':
        file = new Blob(backData["fmso"] ? [backData["fmso"]["timeY"]]: ['No data'], {type: "text/plain"});
        break;
      case 'frec':
        file = new Blob(backData["fmso"] ? [backData["fmso"]["frecY"]]: ['No data'], {type: "text/plain"});
        break;
      case 'average':
        file = new Blob(backData["average"] ? [backData["average"]["timeY"]]: ['No data'], {type: "text/plain"});
        break;
    }

    element.href = URL.createObjectURL(file);
    element.download = name + ".txt"
    element.click();
}

/**/////////////////////////////////////////////
//////////                       ///////////////
//////////  COOKIES FUNCTIONS    ///////////////
//////////                       ///////////////
/////////////////////////////////////////////**/

function setCokie(name, value) {
    document.cookie = name + "=" + value + "; path=/; expires=" + expiry.toGMTString();
};

function getCookie(cname){
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

