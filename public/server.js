const express = require('express');
const path = require('path');
const fs = require('fs');
const {glob} = require("glob") 
const app = express();

app.use(express.static(path.join(__dirname)));

let globalFileList;

function GetFilePaths(){
    const files = glob.sync('/mnt/TheMegaGasDrive/Music/**/*.flac', {});
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

function main(){
    globalFileList = GetFilePaths();
    globalFileList = ShuffleArray(globalFileList)
    console.log(globalFileList[0]);
}

main();

app.listen(8080);
