console.log("David was Here");
console.log("Version Infinity Void");

/**/////////////////////////////////////////////
//////////                      ////////////////
//////////  GLOBAL VARIABLES    ////////////////
//////////                      ////////////////
/////////////////////////////////////////////**/

let ip_address = window.location.hostname,
    webSocket,
    storageData = getData("storage"),
    plotsData = getData("plots");

const Status = document.getElementById("id_status"),
      TimePlotInput = document.querySelector("#timePlotIn"),
      FrecPlotInput = document.querySelector("#frecuencyPlotIn");

/**/////////////////////////////////////////////
//////////                      ////////////////
//////////  STARTING ACTIONS    ////////////////
//////////                      ////////////////
/////////////////////////////////////////////**/

Object.entries(storageData).forEach((key, value) => {document.querySelector("#"+key).value = value});

connectWebSockets();

drawPlots();

/**/////////////////////////////////////////////
//////////                       ///////////////
//////////  WEBSOCKET FUNCTIONS  ///////////////
//////////                       ///////////////
/////////////////////////////////////////////**/

/**
  * Function to confirm the conection with the server.
  *
**/
webSocket.onopen = function() {
    Status.innerText = "Conectado a " + ip_address + ":5500";
};

/**
  * Function to confirm the disconection with the server and reconnect with websocket.
  *
**/
webSocket.onclose = function() {
    Status.innerText = "Socket desconectado";
    setTimeout(function() {
      connectWebSockets();
    }, 2000);// Reconnect websocket after two seconds
};

/**
  * Function to retreive backend data and update plots in the interfaz.
  *
  * @param {object} info Dictionary with data about the Virtual Bench.
**/
webSocket.onmessage = function (info) {
    plotsData = JSON.parse(info.data);
    console.log(plotsData)
    
    if(plotsData["connectDev"]){
      document.querySelector("div.gen-buttons").style.visibility = "visible"; 
    } else {
      document.querySelector("div.gen-buttons").style.visibility = "hidden"; 
      document.querySelector("#timePlotIn").innerHTML = ""; 
      document.querySelector("#frecuencyPlotIn").innerHTML = ""; 
    }
    drawPlots();
    setData("plots", plotsData)
};

/**
  * Function to reconnect with websocket.
  *
**/
function connectWebSockets(){
    webSocket = new WebSocket("ws://" + ip_address + ":1025/");
}

/**
  * Function to send requests to backend.
  *
  * @param {object} button Button pressed by the user.
  * @param {object} inputs Virtual Bench configuration inputs.
**/
function sendmsg(button, inputs){
    storageData["button"] = button;
    inputs.forEach(element => {
      element.name != "model"? storageData[element.name] = element.valueAsNumber : storageData[element.name] = element.value;
    });
    webSocket.send(JSON.stringify(storageData));
    delete storageData["button"];
    setData("plots", storageData);
}

/**/////////////////////////////////////////////
//////////                       ///////////////
//////////   PLOTLY FUNCTIONS    ///////////////
//////////                       ///////////////
/////////////////////////////////////////////**/

/**
  * Function to create plots in the interfaz.
  *
  * @param {object} plotFeatures Plot features dictionary.
**/
function createPlot(plotFeatures){
    Plotly.newPlot( plotFeatures["divId"], [{
      x: plotFeatures["dataX"],
      y: plotFeatures["dataY"]}], {
          margin: { t: 0 },
          title:{
              text:plotFeatures["title"],
              x: 0.5,
              automargin: true,
              font: {
                family: "Arial",
                size: 15,
                color: "black"
              }
          },  
          xaxis: { 
              title: {
                text: plotFeatures["AxisX"],
                font: {
                  family: "Arial",
                  size: 15,
                  color: "black"
                },
              },
              position: 0.3
              
          },
          yaxis: {
              title: {
                  family: "Arial",
                  text: plotFeatures["AxisY"],
                  font: {
                    size: 15,
                    color: "black"
                  }
                }
          }
      },
      {responsive: true}
    );
}

/**
  * Function to draw the plots.
  *
**/
function drawPlots(){
    if (plotsData["fGen"]){
      document.querySelector("#reloadButton").style.visibility = "visible"; 
      let TimePlotInput ={
          divId : "timePlotIn", 
          dataX : plotsData["fGen"]["t"],
          dataY : plotsData["fGen"]["timeY"],
          title : "Señal en el tiempo",
          axisX : "t [s]",
          axisY : "f(t) [V]", 
      };
      createPlot(TimePlotInput);
      let FrecPlotInput ={
        divId : "frecuencyPlotIn", 
        dataX : plotsData["fGen"]["w"],
        dataY : plotsData["fGen"]["frecY"],
        title : "Señal en la frecuencia",
        axisX : "w [Hz]",
        axisY : "f(w) [V]",
      };
      createPlot(FrecPlotInput);
    }

    if (plotsData["fmso"]){
      let TimePlotOut ={
        divId : "timePlotOut", 
        dataX : plotsData["fmso"]["t"],
        dataY : plotsData["fmso"]["timeY"],
        title : "Señal en el tiempo",
        axisX : "t [s]",
        axisY : "f(t) [V]", 
      };
      createPlot(TimePlotOut);
      let FrecPlotOut ={
        divId : "frecuencyPlotOut", 
        dataX : plotsData["fmso"]["w"],
        dataY : plotsData["fmso"]["frecY"],
        title : "Señal en la frecuencia",
        axisX : "w [Hz]",
        axisY : "f(w) [V]",
      };
      createPlot(FrecPlotOut);
    } 

    if(plotsData["average"]){
      let timePlotAverage ={
        divId : "timePlotAverage", 
        dataX : plotsData["average"]["t"],
        dataY : plotsData["average"]["timeY"],
        title : "Señal en el tiempo",
        axisX : "t [s]",
        axisY : "f(t) [V]", 
      };
      createPlot(timePlotAverage);
    }
};
/**/////////////////////////////////////////////
//////////                       ///////////////
//////////  DOWNLOAD FUNCTIONS   ///////////////
//////////                       ///////////////
/////////////////////////////////////////////**/

/**
  * Function to download data send by backend.
  *
**/
function saveFile(){
    const name = document.querySelector("input#id_nameFile").value,
          type = document.querySelector("select.input-style").value,
          element = document.createElement("a");
    let file;

    console.log(plotsData)
    switch(type){
      case "time":
        file = new Blob(plotsData["fmso"] ? [JSON.stringify(plotsData)]: ["No data"], {type: "text/plain"});
        break;
      case "frec":
        file = new Blob(plotsData["fmso"] ? [mergeArrays(plotsData["fmso"]["frecY"], plotsData["fmso"]["frecY"]).join("\n")]: ["No data"], {type: "text/plain"});
        break;
      case "average":
        file = new Blob(plotsData["average"] ? [mergeArrays(plotsData["fmso"]["frecY"], plotsData["fmso"]["frecY"]).join("\n")]: ["No data"], {type: "text/plain"});
        break;
    }

    element.href = URL.createObjectURL(file);
    element.download = name + ".txt"
    element.click();
}

/**
  * Function to merge two arrays into one array (array[i] = "arrayX[i] arrayY[i]").
  *
  * @param {object} arrayX Array with the x values.
  * @param {object} arraY Array with the y values.
**/
function mergeArrays(arrayX, arraY){
  let data = [];
  arrayX.map(function(element, position){ 
    data.push(element + " " + arraY[position]);
  });
  return data;
}
/**/////////////////////////////////////////////
//////////                         ///////////////
////////// LOCAL STORAGE FUNCTIONS ///////////////
//////////                         ///////////////
/////////////////////////////////////////////**/

/**
  * Function to get information of the browser.
  *
  * @param {string} key data id.
**/
function getData(key){
  let data = JSON.parse(localStorage.getItem(key))
  return data ? data : {};
};

/**
  * Function to set information in the browser.
  *
  * @param {string} key data id.
  * @param {string} data data information.
**/
function setData(key, data){
  localStorage.setItem(key, JSON.stringify(data));
};


