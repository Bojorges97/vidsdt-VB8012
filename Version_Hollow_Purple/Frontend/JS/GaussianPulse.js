let canvas = document.querySelector("canvas#osciloscope");
let Status = document.getElementById('id_status');
// let inputElem = document.getElementById('id_buffers');
let ip_address = window.location.hostname;
console.log(ip_address)
let webSocket = new WebSocket("ws://" + ip_address + ":1025/");
console.log("David was Here");
console.log("Version Hollow_purple");

let data = {};

webSocket.onmessage = function(info) {
    let data = JSON.parse(info.data);
    console.log(data)
    if (data["data"]){
        // console.log(JSON.parse(data["data"]))
        plotData(data["data"]);
        return false
    }
}

function sendmsg(steps){
    steps.forEach(element =>data[element.name]=element.valueAsNumber);
    console.log(data);
    webSocket.send(JSON.stringify(data));
}

///////////////////////////////////////////////////////////////////////////////////




// canvas.width = canvas.parentElement.clientWidth;
// canvas.height =  6000;
// canvas.lineWidth = 0.5;
// // canvas.numBuffers = 1;
// canvas.baudRate = 0;
// canvas.data = [];
// canvas.allData = [];

// window.addEventListener('resize', function(event){
//     canvas.width = canvas.parentElement.clientWidth;
//     canvas.height = canvas.parentElement.clientHeight-100;
// })

// // inputElem.addEventListener('input', () => {
// //     canvas.numBuffers = parseInt(inputElem.value)
// // });

webSocket.onopen = function(frame) {
    Status.innerText = "Conectado " + ip_address + ":8080";
    console.log("Connected to: " + ip_address + ":8080")
};

// webSocket.onclose = function(frame) {
//     Status.innerText = "Socket desconectado";
//     console.log("Socket disconnected ")
// };

// function plotData(data) {
//     let ctx = canvas.getContext("2d");
//     canvas.data.push(data);
//     canvas.allData.push(data);
//     canvas.baudRate = Math.floor(canvas.allData.flat(1).length/canvas.allData.length);
//     // document.getElementById("id_baudRate").innerText = "BaudRate :" + canvas.baudRate;
//     // while(canvas.data.length>canvas.numBuffers){
//     //     canvas.data.shift();
//     // }

//     let dataMap = mapCanvas(canvas.data.flat(1),canvas.width, canvas.height);
//     window.data = canvas.data;
//     clearCanvas();
//     window.dataMap = dataMap;
//     ctx.beginPath();
//     ctx.strokeStyle = "white";
//     ctx.lineWidth = canvas.lineWidth;
//     dataMap.forEach(function insertElement(currentValue, index, array){
//         let X = currentValue[0];
//         let Y = currentValue[1];
//         ctx.lineTo(X, Y);
//     });
//     ctx.stroke();
//     getFileSize();
// }




// function getFileSize(){
//     let sizeLabel = document.getElementById('id_sizeFile');
//     let size = canvas.allData.flat(1).length/1024*4;
//     size = size.toPrecision(4);
//     sizeLabel.innerText = size + "KB";
// }




// function mapCanvas(array,maxX, maxY){
    
//     let values = [];
//     let maxXOld = array.length;
//     let maxYOld = 1200;

//     for(let index=0; index<array.length; index++){
//         let Y = (maxYOld-array[index])*maxY/maxYOld;
//         let X =                (index)*maxX/maxXOld;
//         values.push([X,Y]);
//     }
//     return values;
// }




// function clearCanvas() {
//     let ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.fillStyle = 'rgba(0,0,0)';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//     ctx.fillStyle = 'rgba(0,0,0)';

//     for(let i=1; i<5; i++){
//         ctx.beginPath();
//         ctx.strokeStyle = "white";
//         ctx.moveTo(0,  i*canvas.height/5);
//         ctx.lineTo(canvas.width, i*canvas.height/5);
//         ctx.lineWidth = 0.6;
//         ctx.stroke();
//     }

//     ctx.beginPath();
//     ctx.strokeStyle = "#9B9B9B";
//     ctx.moveTo(0,0);
//     ctx.lineTo(0,canvas.height);
//     ctx.lineTo(canvas.width,canvas.height);
//     ctx.lineTo(canvas.width,0);
//     ctx.lineTo(0,0);
//     ctx.lineWidth = 5;
//     ctx.stroke();
// }





// function saveFile(){
// let datos = JSON.stringify(canvas.allData);
// datos = datos.replaceAll(',','\n');
// datos = datos.replaceAll('[','');
// datos = datos.replaceAll(']','');
// let blob = new Blob([datos], {type: "text/txt"});

// let url = window.URL.createObjectURL(blob);
// let anchor = document.createElement("a");
// anchor.href = url;
// let nameFile = document.getElementById('id_nameFile').value;
// if(!nameFile.length)
//     anchor.download = "demo.txt";
// else
//     anchor.download = (nameFile + ".txt");
// console.log(anchor)
// anchor.click();
// window.URL.revokeObjectURL(url);
// anchor.remove();
// }




// function clearFile(){
//     clearCanvas();
//     canvas.data = [];
//     canvas.allData = [];
//     canvas.baudRate = 0;
// }