// For triggered events
console.log("===running actions.js");

const btnAnalyze = document.getElementById("analyzeBtn")
const txtOutput = document.getElementById("infoAbtSelected")
const txtInput = document.getElementById("textarea")

btnAnalyze.addEventListener("click", analyze)

async function analyze() {
	console.log("===Analyzing");
	var extractedText = document.getElementById("textarea").value;
	console.log("===Extracted text:\n" + extractedText);

	document.getElementById("loadingImg").style.display = 'block';

	document.getElementById("infoAbtSelected").innerHTML = "No input provided";
	document.getElementById("textarea").placeholder = "Please select text to analyze.";
	document.getElementById("score").style.display = 'none';
	document.getElementById("viewAnalyticsContainer").style.display = 'none';
	document.getElementById("searchResultsContainer").style.display = 'none';

	try{
		let responseText = await getAnalysis();
		let response = JSON.parse(responseText)

		console.log("===xhr.responseText:\n" + responseText);
		console.log(response)

		let rankLen = 50257
		let avg = response.real_topk.reduce((total, val) => total + val[0], 0)/rankLen
		console.log((avg*100).toPrecision(2))
		document.getElementById("score").innerText = (avg*100).toPrecision(2);
		document.getElementById("score").style.display = 'block';

		document.getElementById("loadingImg").style.display = 'none';

		document.getElementById("infoAbtSelected").innerHTML = "Length: " + extractedText.length;
		document.getElementById("viewAnalyticsContainer").innerHTML = "<a id='viewAnalytics' class='btn noselect'>View Analytics</a>";
		document.getElementById("viewAnalyticsContainer").style.display = 'inline';
		document.getElementById("searchResultsContainer").innerHTML = "<a id='searchResults' class='btn noselect'>Search on Google</a>";
		document.getElementById("searchResultsContainer").style.display = 'inline';
		document.getElementById('searchResults').addEventListener("click", function () {
			chrome.tabs.create({
				url: 'https://www.google.com/search?q=' + document.getElementById("textarea").value,
				active: false
			})
		});

	}catch(e){
		console.log(e)
	}
}

function getAnalysis(){
	return new Promise(function(resolve, reject){
		var url = "http://5e42c4bac232.ngrok.io/gp";

		var xhr = new XMLHttpRequest();
		xhr.open("POST", url);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onload = function () {
		   if (xhr.status == 200) {
			  	resolve(xhr.responseText)
		   }else{
		   		reject(xhr.status)
		   }
		};
		xhr.send("text="+encodeURI(txtInput.value));
	});
}