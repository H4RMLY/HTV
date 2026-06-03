const express = require('express');
const path = require('path');
const fs = require('fs');
const {glob} = require("glob") 
const app = express();

app.use(express.static(path.join(__dirname)));

let globalFileList;
const fileCache = [];
const connectedClients = new Map(); // Track clients with unique IDs

function main(){
  InitialiseServer();
}

function GetFilePaths(){
    const files = glob.sync('/mnt/TheMegaGasDrive/Music/**/*.flac', {});
    return files;
}

function ShuffleArray(array){
    let m = array.length, i, t;

  while (m) {
    i = Math.floor(Math.random() * m--);
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
    const filename = splitString.pop();
    splitString.pop();
    const artist = splitString.pop()
    return {"filename": filename,"artist": artist};
  }
}

function CreateReadableStream(filePath){
  const readable = fs.createReadStream(filePath); 
  return readable
}

function KillClientStream(clientId) {
  const client = connectedClients.get(clientId);
  if (client) {
    if (client.readable && !client.readable.destroyed) {
      client.readable.destroy();
    }
    if (client.response && !client.response.writableEnded) {
      client.response.end();
    }
    connectedClients.delete(clientId);
    console.log(`Stream killed for client ${clientId}`);
  }
}

function ConnectClientToStream(req, res){
  const streamId = `stream-${Date.now()}-${Math.random()}`;
  console.log(`Creating new stream for ${streamId}`);
  
  const filePath = fileCache[1].path;
  const stream = CreateReadableStream(filePath);
  
  // Store client connection info
  connectedClients.set(streamId, {
    readable: stream,
    response: res
  });

  res.setHeader('Content-Type', 'audio/mpeg');

  // Handle client disconnect or request abort
  req.on('aborted', () => {
    console.log(`Request aborted for ${streamId}`);
    KillClientStream(streamId);
  });

  res.on('close', () => {
    console.log(`Client ${streamId} disconnected`);
    KillClientStream(streamId);
  });

  res.on('error', (err) => {
    console.error(`Error for client ${streamId}:`, err);
    KillClientStream(streamId);
  });

  // Handle readable stream errors
  stream.on('error', (err) => {
    console.error(`Readable stream error for ${streamId}:`, err);
    KillClientStream(streamId);
  });

  // Handle stream end
  stream.on('end', () => {
    console.log(`Stream ended for ${streamId}`);
    res.end();
    connectedClients.delete(streamId);
  });

  // Pipe the stream
  stream.pipe(res);
}

main();

app.get('/NextFile', (req, res) => {
  ShiftFilesForward(req, res);
  // Kill all active streams when user clicks next
  connectedClients.forEach((client, clientId) => {
    KillClientStream(clientId);
  });
});

app.get('/PrevFile', (req, res) => {
  ShiftFilesBackward(req, res);
  // Kill all active streams when user clicks previous
  connectedClients.forEach((client, clientId) => {
    KillClientStream(clientId);
  });
});

app.get('/ConnectToServer', ConnectToClient);
app.get('/ConnectClientToStream', ConnectClientToStream);

app.listen(8080);