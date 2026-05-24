const elements = [];
const currentFocus = [];

const pageContent = {
	about : {
		title : "About ",
		content: {	Name: "Harry Morley", 
					Birthday: "17-08-2003", 
					Education: [
						"BSc Cyber Securuty and Forensic Computing (First-Class Honour)", 
						" IT BTECH National Diploma Level 3 (Distinction* x2)",
						" A-Level Graphic Design (A)",
						" GCSE English and Maths (6)"
					],
				},
		assets: [{src: "./assets/about/me.jpg", alt: "ME!", name: "pfp"}]
	},
	interests : {
		title: "Interests ",
		content: { 
			Interests: ["Programming (Duh)", 
						" Cooking", 
						" Gaming", 
						" Video Editing", 
						" Graphic Design"
					]},
	},
	skills : {
		title: "Skills ", 
		content: {
			ProgrammingLanguages : ["Python", " JavaScript", " Dart", " HTML5", " CSS"],
			Experience : ["C", " X86 Assembly", " LUA", " MySQL", " Java"],
			Tools : ["FTK", " Autopsy", " Wireshark", " GDB", " IDA", " Git"],
			Frameworks : ["React", " Node.js"],
			OS : ["Windows", " Linux"],
			Practical : [
				"Reverse Engineering Malware", 
				" Static and Dynamic Malware Analysis",
				" Predictive Modeling and Classification",
				" Penetration Testing",
				" Vulnerability Assessment",
				" Software Development Lifecycle"
				]
		},
		assets: [
				 {src: "./assets/skills/autopsy-logo.png", alt: "Autopsy Logo", name: "autopsy-logo"},
				 {src: "./assets/skills/dart-logo.png", alt: "Dart Logo", name: "dart-logo"},
				 {src: "./assets/skills/java-logo.png", alt: "Java Logo", name: "java-logo"},
				 {src: "./assets/skills/lua.jpg", alt: "Lua Logo", name: "lua-logo"},
				 {src: "./assets/skills/python-logo", alt: "Python Logo", name: "python-logo"},
				 {src: "./assets/skills/x86-logo.png", alt: "X86 Logo", name: "x86-logo"}
				]
	},
	cv: {
		title: "CV ",
		content: "./assets/Harrison-Morley-CV-2025.pdf",
	},
	contact : {
		title: "Contact Me ",
		content: {
		Number: "07555216672",
		Email: "harrymorley91@gmail.com"
		}
	},
}

function grabFolders(){
	const folders = document.querySelectorAll('.folder-container');
	for (const folder of folders){
		elements.push(folder);	
	}
	return 0;
}

function setEventHandlers(){
	for (const folder of elements){
		folder.addEventListener('mouseenter', handleFolderHover);
		folder.addEventListener('mouseleave', handleFolderUnhover);
		folder.children[0].addEventListener('click', handlePageClick);
	}
	const closePageButton = document.querySelector("#close-page-button");
	closePageButton.addEventListener('click', closeFocusedPage);
	return 0;
}

function handleFolderHover(e){
	e.target.children[0].style.top = "-2rem";
	e.target.style.top = "-1rem";
	return 0;
}

function handleFolderUnhover(e){
	e.target.children[0].style.top = "0";
	e.target.style.top = "0";
	return 0;
}

async function handlePageClick(e){
	buildContent(e.target.id);
	const focusedContent = document.querySelector("#fc-container");
	e.target.style.opacity = "0%";
	e.target.style.top = "-4rem";
	currentFocus.push(e.target);
	await sleep(500);
	focusedContent.style.opacity = "100%";
	focusedContent.style.top = "1rem";
	focusedContent.style.pointerEvents = "all";
	return 0;
}

async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function closeFocusedPage(){
	let focusedContent = document.querySelector("#fc-container");
	focusedContent.style.opacity = "0";
	focusedContent.style.top = "0";
	focusedContent.style.pointerEvents = "none";
	await sleep(300);
	currentFocus[0].style.opacity = "100%";
	currentFocus[0].style.top = "0";
	currentFocus.pop();
	clearContent();
	return 0;
}

function buildContent(pageName){
	const titleElem = document.querySelector("#fc-title");
	const contentElem = document.querySelector("#fc-content");
	if (pageName == "cv"){
		titleElem.textContent = pageContent[pageName].title;
		const docFrame = document.createElement("object");
		docFrame.setAttribute("type", "application/pdf")
		docFrame.setAttribute("data", pageContent[pageName].content);
		docFrame.style.width = "1280px";
		docFrame.style.height = "780px";
		contentElem.appendChild(docFrame);
	} else {
		titleElem.textContent = pageContent[pageName].title;
		const content = pageContent[pageName].content;
		for (const key in content){
			const listItem = document.createElement("div");
			const value = content[key];
			const text = key + ": " + value;
			listItem.textContent = text;
			contentElem.appendChild(listItem);
		}
		if (pageContent[pageName].assets){
			const fcContainer = document.querySelector("#fc-container");
			for (const img of pageContent[pageName].assets){
				const imgFrame = document.createElement("img");
				imgFrame.setAttribute("src", img.src);
				imgFrame.setAttribute("alt", img.alt);
				imgFrame.classList.add(pageName);
				imgFrame.setAttribute("id", img.name);
				fcContainer.appendChild(imgFrame);
			}
		}
	}	
	return 0;
}

function clearContent(){
	const container = document.querySelector("#fc-container");
	const titleElem = container.querySelector("#fc-title");
	const contentElem = container.querySelector("#fc-content");
	const imgs = container.querySelectorAll("img");
	titleElem.textContent = "";
	contentElem.innerHTML = "";
	for (const img of imgs){
		img.remove();
	}
	return 0;
}

function main(){
	grabFolders();
	setEventHandlers();
	return 0;
}

main();
