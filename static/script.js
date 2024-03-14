var table = [];
var state = 0;

// Set State
document.getElementById("focus").addEventListener("change", function(){
	// this.blur();
	if(this.value == "practice"){
		table = objectify();
		if(!formatChecker(table)){
			alert("Table is broken. Can't practice");
			return this.value = "manage";
		}
		nextCard();
	}

	document.querySelectorAll(".container").forEach((e) => e.style.display = "none");
	document.querySelector(`.container#${this.value}`).style.display = "block";
	state = +(this.value == "practice");
});

// Practice
var used = [];
var id2w = ["English", "Pinyin", "Chinese"];

document.addEventListener("keydown", function(e){
	if(state){
		// e.preventDefault();
		document.activeElement.blur();
		if(e.code == "Space") flip();
		if(e.code == "Enter") nextCard();
	}
});

document.getElementById("next").addEventListener("click", nextCard);
document.getElementById("flip").addEventListener("click", flip);

function flip(){
	var card = document.querySelector("card");
	card.setAttribute("showing", 1-+card.getAttribute("showing"));
}

function nextCard(){
	document.querySelector("card").setAttribute("showing", 0);
	if(used.length == table.length) used = [];
	var index = parseInt(Math.random() * table.length);
	while(used.includes(index)) index = parseInt(Math.random() * table.length);
	used.push(index);

	var allowed = Array.from(document.querySelectorAll("input[type='checkbox']")).filter((e) => e.checked).map((e) => parseInt(e.id));
	var testingOn = allowed[parseInt(Math.random() * allowed.length)];
	var checkingAgainst = [0, 1, 2].filter((e) => e != testingOn);

	document.querySelector("card front p#class").innerText = id2w[testingOn];
	document.querySelector("card front h1#value").innerText = table[index][testingOn];
	document.querySelector("card front h1#value").style.fontSize = "xx-large";
	document.querySelector("card front h1#value").style.fontFamily = "'Roboto', sans-serif";
	if(testingOn == 2){
		document.querySelector("card front h1#value").style.fontSize = "40px";
		document.querySelector("card front h1#value").style.fontFamily = "SCKaiti";
	}

	var backClasses = document.querySelectorAll("card back span#class");
	var backValues = document.querySelectorAll("card back span#value");
	
	for(var i = 0; i <= 1; i++){
		backClasses[i].innerText = id2w[checkingAgainst[i]];
		backValues[i].innerText = table[index][checkingAgainst[i]];
		backValues[i].style.fontSize = "large";
		backValues[i].style.fontFamily = "'Roboto', sans-serif";
		if(checkingAgainst[i] == 2){
			backValues[i].style.fontSize = "24px";
			backValues[i].style.fontFamily = "SCKaiti";
		}
	}
}

// Manage Dataset
if(localStorage.getItem("table") != null){
	var data = JSON.parse(localStorage.getItem("table"));
	for(var row of data){
		var rows = document.querySelectorAll("div#manage table tr");
		newRow(rows[rows.length-1], false, row);
	}
}

window.addEventListener('beforeunload', function(){
	this.localStorage.setItem("table", JSON.stringify(objectify()));
});

document.getElementById("newrow").addEventListener("click", function(){
	var rows = document.querySelectorAll("div#manage table tr");
	newRow(rows[rows.length-1]);
});

document.getElementById("export").addEventListener("click", function(){
	var data = objectify();
	if(!formatChecker(data)) return alert("Couldn't save");
	var blob = new Blob([JSON.stringify(data)], { type: "application/json" });
	url = window.URL.createObjectURL(blob);
	var a = document.getElementById("downloader");
	a.href = url;
	a.download = "export.json";
	a.click();
	window.URL.revokeObjectURL(url);
});

document.querySelector("#import input").addEventListener("change", function(){
	if(!this.files[0]) return;
	if(this.files[0].type != "application/json") return;

	var fileReader = new FileReader();
	fileReader.onload = function(){
		var data = JSON.parse(fileReader.result);
		if(!formatChecker(data)) return alert("Invalid save");
		var rows = document.querySelectorAll("div#manage table tr:has(td)").forEach((e) => e.remove());
		for(var row of data){
			var rows = document.querySelectorAll("div#manage table tr");
			newRow(rows[rows.length-1], false, row);
		}
	};
	fileReader.readAsText(this.files[0]);
});

function formatChecker(data){
	if(!Array.isArray(data)) return false;

	for(var elem of data){
		if(!Array.isArray(elem)) return false;
		if(elem.length != 3) return false;
		for(var item of elem) if(typeof item != "string") return false;
	}

	return true;
}

function objectify(){
	return Array.from(document.querySelectorAll("tr:has(td)")).map(function(e){
		return Array.from(e.querySelectorAll("input")).map((e) => e.value);
	});
}

function newRow(after, focus, values){
	var tr = document.createElement("tr");
	
	var english = document.createElement("td");
	var englishInput = document.createElement("input");
	englishInput.placeholder = "English";
	englishInput.value = values?.[0] || "";
	englishInput.addEventListener("keydown", inputEvents(englishInput));
	english.appendChild(englishInput);

	var pinyin = document.createElement("td");
	var pinyinInput = document.createElement("input");
	pinyinInput.placeholder = "Pinyin";
	pinyinInput.value = values?.[1] || "";
	pinyinInput.addEventListener("keydown", inputEvents(pinyinInput));
	pinyin.appendChild(pinyinInput);

	var chinese = document.createElement("td");
	var chineseInput = document.createElement("input");
	chineseInput.placeholder = "Chinese";
	chineseInput.value = values?.[2] || "";
	chineseInput.addEventListener("keydown", inputEvents(chineseInput));
	chinese.appendChild(chineseInput);

	var trash = document.createElement("td");
	var icon = document.createElement("i");
	icon.className = "fa-solid fa-trash";
	icon.addEventListener("click", deleteRow(icon));
	trash.appendChild(icon);

	tr.append(english, pinyin, chinese, trash);
	after.after(tr);

	if(focus) englishInput.focus();
}

function deleteRow(e){
	return function(){
		e.parentElement.parentElement.remove(e.parentElement);
	}
}

function inputEvents(elem){
	return function(e){
		if(e.code == "ArrowRight" && e.altKey){
			elem.parentElement.nextElementSibling?.querySelector("input")?.focus()
		}
		
		if(e.code == "ArrowLeft" && e.altKey){
			elem.parentElement.previousElementSibling?.querySelector("input")?.focus()
		}

		if(e.code == "ArrowUp" && (e.altKey || e.ctrlKey || e.metaKey)){
			elem.parentElement.parentElement.previousElementSibling?.querySelector(`input[placeholder="${elem.placeholder}"]`)?.focus()
		}

		if(e.code == "ArrowDown" && (e.altKey || e.ctrlKey || e.metaKey)){
			elem.parentElement.parentElement.nextElementSibling?.querySelector(`input[placeholder="${elem.placeholder}"]`)?.focus()
		}

		if(e.code == "Enter"){
			if(e.altKey || e.ctrlKey || e.metaKey) newRow(elem.parentElement.parentElement, true);
			if(e.shiftKey){
				fetch("/translate", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						from: elem.placeholder,
						text: elem.value
					})
				}).then((res) => res.json())
				.then(function(res){
					for(var key of Object.keys(res)){
						elem.parentElement.parentElement.querySelector(`input[placeholder="${key}"]`).value = res[key];
					}
				}).catch(function(err){
					console.log(err);
				})
			}
		}

		if(e.code == "Backspace" && (e.shiftKey || e.altKey)){
			e.preventDefault();
			elem.parentElement.parentElement.previousElementSibling?.querySelector(`input[placeholder="${elem.placeholder}"]`)?.focus()
			elem.parentElement.parentElement.remove();
		}
	}
}