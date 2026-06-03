const elements = {};
let audioAbortControl = null; // Track abort controller for current stream

window.addEventListener('load', main);

async function main(){
    GrabHTMLHandles();
    SetButtonEvents();
    const firstFile = await ConnectToServer();
    SetFileInfo(firstFile);
    ConnectToStream();
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
    RefreshSource();
}

function PrevFileButtonEvent(){
    GetPrevFile();
    RefreshSource();
}

function RefreshSource(){
    // Abort the current stream if one is active
    if (audioAbortControl) {
        audioAbortControl.abort();
        audioAbortControl = null;
    }

    // Remove and recreate the audio element
    document.querySelector('#video').remove();
    const template = document.querySelector('#videoTemp');
    const newSource = template.content.cloneNode(true);
    const sourceContainer = document.querySelector('#videoContainer');
    newSource.querySelector('.video').setAttribute('id', 'video')
    sourceContainer.appendChild(newSource);
    
    ConnectToStream();
}

async function GetNextFile(){
    const response = await fetch('/NextFile');
    if (response.ok){
        const nextFile = await response.json();
        console.log(nextFile);
        SetFileInfo(nextFile);
    }
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

async function ConnectToStream(){
    // Create a new abort controller for this stream
    audioAbortControl = new AbortController();
    
    // Create a unique URL with cache busting parameter
    const timestamp = Date.now();
    const src = `/ConnectClientToStream?t=${timestamp}`;
    
    document.querySelector('#videoSource').setAttribute('src', src);
    const sourceElement = document.querySelector('#video');
    
    sourceElement.addEventListener('ended', AudioEndedEvent, { once: true });
    sourceElement.addEventListener('error', AudioErrorEvent);

    sourceElement.load(); // Force the browser to load the new source
    sourceElement.play().catch(err => console.error("Audio playback error:", err));
}

function AudioEndedEvent(){
    console.log("Audio ended, moving to next file");
    NextFileButtonEvent();
}

function AudioErrorEvent(){
    console.error("Audio playback error, playing next");
    NextFileButtonEvent();
}

function SetFileInfo(currentFile){
    elements.fileTitle.textContent = currentFile.filename;
    elements.fileArtist.textContent = currentFile.artist;
}