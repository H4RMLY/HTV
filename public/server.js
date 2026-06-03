const express = require('express');
const path = require('path');
const fs = require('fs');
const {glob} = require("glob") 
const app = express();

app.use(express.static(path.join(__dirname)));

let globalFileList;
const fileCache = [];
const connectedWritables = [];

function main(){
  InitialiseServer();
}

function GetFilePaths(){
    const files = glob.sync('/mnt/TheMegaGasDrive/Music/**/*.mp3', {});
    return files;
}

function ShuffleArray(array){
    let m = array.length, i, t;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function InitialiseServer(){
  globalFileList = ShuffleArray(GetFilePaths())
  StartFromBeginning();
    
  for (const item of fileCache){
    console.log("[ITEM "+ item.index +"]: " + item.path);
  }
}

function StartFromBeginning(){
  fileCache.push({"path": null, "index": null}); 
  fileCache.push({"path": globalFileList[0], "index": 0});
  fileCache.push({"path": globalFileList[1], "index": 1});
}

function ShiftFilesForward(req, res){
  fileCache[0] = fileCache[1];
  fileCache[1] = fileCache[2];
  fileCache[2] = GetNextFile(fileCache[2]);
  
  res.json(GetNiceFilename(fileCache[1].path));
}

function GetNextFile(currentFile){
  const currentIndex = currentFile.index;
  const nextIndex = currentIndex + 1;
  const nextFile = globalFileList[nextIndex];
  return nextFile == undefined ? {"path": null, "index": null} : {"path": nextFile, "index": nextIndex};
}

function ShiftFilesBackward(req, res){
  fileCache[2] = fileCache[1];
  fileCache[1] = fileCache[0];
  fileCache[0] = GetPrevFile(fileCache[0]);

  res.json(GetNiceFilename(fileCache[1].path));
}

function GetPrevFile(currentFile){
  const currentIndex = currentFile.index;
  const prevIndex = currentIndex - 1;
  const prevFile = globalFileList[prevIndex];
  return prevFile == undefined ? {"path": null, "index": null} : {"path": prevFile, "index": prevIndex};
}

function ConnectToClient(req, res){
  res.json(GetNiceFilename(fileCache[1].path));
}

function GetNiceFilename(filePath){
  if (filePath != null){
    const splitString = filePath.split("/");
    return splitString.pop();  
  }
}

function CreateReadableStream(filePath){
  const readable = fs.createReadStream(filePath); 
  return readable
}

async function StartStream(readable){
  
}

function CreateWriteableStream(){
  const writeable = new WritableStream();
  return writeable
}

function ConnectClientToStream(req, res){
  console.log("creating new reader")
  const readable = CreateReadableStream(fileCache[1].path);
  //res.setHeader('Content-Type', 'audio/flac');
  connectedWritables.push(res);

  readable.pipe(connectedWritables[0]);
  setTimeout(()=>{KillStream(readable)}, 10000)
  //readable.unpipe(res);
}

function KillStream(stream){
  stream.unpipe(connectedWritables[0]);
  console.log("dead");
}

function PipeToAllWritables(chunk){
  for (const connection of connectedWritables){
    connection.write(chunk);
  }
}

main();

app.get('/NextFile', ShiftFilesForward);
app.get('/PrevFile', ShiftFilesBackward);
app.get('/ConnectToServer', ConnectToClient);
app.get('/ConnectClientToStream', ConnectClientToStream);

app.listen(8080);
