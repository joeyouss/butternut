
console.log("from foreground");

chrome.tabs.executeScript( {
	code: "window.getSelection().toString();"
}, function(selection) {
	document.getElementById("textarea").value = selection[0];
	console.log(selection[0]);
});