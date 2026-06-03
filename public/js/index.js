const elements = {};

window.addEventListener('load', main);

async function main(){
    GrabHTMLHandles();
    SetButtonEvents();
    const firstFile = await ConnectToServer();
    SetFileInfo(firstFile);
}

function GrabHTMLHandles(){
    elements.nextFileButton = document.querySelector('#nextVid');
    elements.prevFileButton = document.querySelector('#prevVid');
    elements.fileTitle = document.querySelector('#videoTitle');
    elements.fileArtist = document.querySelector('#videoArtist');
}

function SetButtonEvents(){
    elements.nextFileButton.addEventListener('click', NextFileButtonEvent);
    elements.prevFileButton.addEventListener('click', PrevFileButtonEvent);
}

function NextFileButtonEvent(){
    GetNextFile();
}

async function GetNextFile(){
    const response = await fetch('/NextFile');
    if (response.ok){
        const nextFile = await response.json();
        console.log(nextFile);
        SetFileInfo(nextFile);
    }
}

function PrevFileButtonEvent(){
    GetPrevFile();
}

async function GetPrevFile(){
    const response = await fetch('/PrevFile');
    if (response.ok){
        const prevFile = await response.json();
        console.log(prevFile);
        SetFileInfo(prevFile);
    }
}

async function ConnectToServer(){
    const response = await fetch('/ConnectToServer');
    if (response.ok){
        const firstFile = await response.json();
        console.log("Connection to server successful!");
        return await firstFile
    }
}

function SetFileInfo(currentFile){
    elements.fileTitle.textContent = currentFile;
}