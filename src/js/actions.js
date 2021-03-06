// For triggered events
console.log("===running actions.js");

const btnAnalyze = document.getElementById("analyzeBtn");
const btnViewAnalytics = document.getElementById("viewAnalyticsContainer");
const txtOutput = document.getElementById("infoAbtSelected");
const txtInput = document.getElementById("textarea");
let response = null;

btnAnalyze.addEventListener("click", analyze);

function viewAnalytics() {


	chrome.storage.local.set({ 'selectedText': response }, function () {
		console.log('===Value is set to: ' + response);
	});
	chrome.tabs.create({
		url: chrome.extension.getURL('./analytics.html'),
		active: false
	}, function (tab) {
		// After the tab has been created, open a window to inject the tab
		chrome.windows.create({
			tabId: tab.id,
			type: 'app',
			focused: true,
			// width: 400,
			// height: 800
		});
	});
}

async function analyze() {
	console.log("===Analyzing");
	if (txtInput.value.length == 0) {
		document.getElementById("infoAbtSelected").innerHTML = "No input provided";
		document.getElementById("infoAbtSelected").style.display = 'block';
		document.getElementById("textarea").placeholder = "Please select text to analyze.";
		document.getElementById("score").style.display = 'none';
		document.getElementById("scoreDetail").style.display = 'none';
		document.getElementById("viewAnalyticsContainer").style.display = 'none';
		document.getElementById("searchResultsContainer").style.display = 'none';
		btnViewAnalytics.addEventListener("click", null);
		return;
	}
	var extractedText = document.getElementById("textarea").value;
	console.log("===Extracted text:\n" + extractedText);

	document.getElementById("loadingImg").style.display = 'block';

	document.getElementById("infoAbtSelected").innerHTML = "No input provided";
	document.getElementById("infoAbtSelected").style.display = 'none';
	document.getElementById("textarea").placeholder = "Please select text to analyze.";
	document.getElementById("score").style.display = 'none';
	document.getElementById("scoreDetail").style.display = 'none';
	document.getElementById("viewAnalyticsContainer").style.display = 'none';
	document.getElementById("searchResultsContainer").style.display = 'none';

	let responseURL = await fetch("https://raw.githubusercontent.com/btrnt/butternut/main/endpoint.json", {method:"GET"})
	let jsonURL = await responseURL.json();
	let url = jsonURL.url

	let responseText = await getAnalysis(url);
	try {
		response = JSON.parse(responseText)
		console.log("===xhr.responseText:\n" + responseText);
		console.log(response)

		let rankLen = jsonURL.rankLen

		var avg = response.real_topk.reduce((total, val) => total + val[0], 0)/rankLen*100;
		if(jsonURL.src !== "gp"){
			avg /= response.real_topk.length;
		}

		console.log(Math.round(avg).toPrecision(2))
		document.getElementById("score").innerText = Math.round(avg).toString();
		document.getElementById("score").attributes['style'].textContent = 'background-color:' + perc2colorMap(100-avg);
		document.getElementById("score").style.display = 'block';


		document.getElementById("scoreDetail").innerText = "The text is " + perc2word(avg) + "likely to be written by AI.";
		document.getElementById("scoreDetail").style.display = 'block';

		document.getElementById("loadingImg").style.display = 'none';
		document.getElementById("infoAbtSelected").innerHTML = "Length: " + extractedText.length;
		document.getElementById("guideContainer").innerHTML = "<div id='guide'>" +
			"<div id='green' class='colour'>0-25<br>Least Likely</div>" +
			"<div id='yellow' class='colour'>25-50<br>Not Likely</div>" +
			"<div id='orange' class='colour'>50-75<br>Likely</div>" +
			"<div id='red' class='colour'>75+<br>Most Likely</div>" +
			"</div>";
		document.getElementById("guideContainer").style.display = "block";
		document.getElementById("viewAnalyticsContainer").innerHTML = "<a id='viewAnalytics' class='btn noselect'>More Details</a>";
		document.getElementById("viewAnalyticsContainer").style.display = 'block';
		document.getElementById("searchResultsContainer").innerHTML = "<a id='searchResults' class='btn noselect'>Search More Articles</a>";
		document.getElementById("searchResultsContainer").style.display = 'block';
		document.getElementById('searchResults').addEventListener("click", function () {
			chrome.tabs.create({
				url: 'https://www.google.com/search?q=' + document.getElementById("textarea").value,
				active: false
			})
		});
		btnViewAnalytics.addEventListener("click", viewAnalytics);
	} catch (e) {
		console.log(e)
	}
}

function getAnalysis(url) {
	return new Promise(async function (resolve, reject) {


		var xhr = new XMLHttpRequest();
		xhr.open("POST", url);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onload = function () {
			if (xhr.status == 200) {
				resolve(xhr.responseText)
			} else {
				reject(xhr.status)
			}
		};
		xhr.send("text=" + encodeURI(txtInput.value));
	});
}

function perc2color(perc) {
	var r, g, b = 0;
	if (perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}

function perc2colorMap(perc) {
	if (perc < 25) {
		return '#e15b64'
	} else if (perc < 50) {
		return '#ee9153'
	} else if (perc < 75) {
		return '#f8b26a'
	} else {
		return '#abbd81'
	}
}

function perc2word(perc) {
	console.log("=====PERC" + perc);
	if (0 < perc && perc < 25) {
		return 'least '
	} else if (0 < perc && perc < 50) {
		return 'not '
	} else if (0< perc && perc < 75) {
		return ' '
	} else {
		return 'most '
	}
}