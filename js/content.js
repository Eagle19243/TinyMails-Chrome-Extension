function ColorForTimeInSec(timeInSec) {
	if (timeInSec < 30) {
		return "#999";
	} else if (timeInSec < 60) {
		return "#95832c";
	} else if (timeInSec < 90) {
		return "#df9636";
	} else if (timeInSec < 120) {
		return "#e46b30";
	} 

	return "#fc0000";
}

InboxSDK.load('1', 'sdk_shorteremails_f9eda92906').then(function(SDK){
	var composeCount = 0;

	// the SDK has been loaded, now do something with it!
	SDK.Compose.registerComposeViewHandler(function(composeView){
        var timeOutID;
		var readingSpeedWPM = 190;
		var mainDivID = 'wse_main_' + composeCount;

		var statusBar = composeView.addStatusBar({
			height: 21
		});

		statusBar.el.innerHTML = "<div class='wse-main' id='"+ mainDivID + "'></div>";

		composeCount++;

		composeView.getBodyElement().onkeydown = function(){
			Update();
		}

		function Update() {
        	if (timeOutID == null) {
	        	timeOutID = window.setTimeout(function(){
					var bodyElement = $(composeView.getBodyElement()).clone();
		        	$(bodyElement).find('div[data-smartmail="gmail_signature"]').remove();

					var bodyText = $(bodyElement).text().trim();
					var wordCount;
					
		        	if (bodyText.length == 0) {
		        		wordCount = 0;
		        	} else {
			        	wordCount = bodyText.split(/\s+/).length;
					}

		        	var timeToReadMin = wordCount / readingSpeedWPM;
		        	var timeToReadFormatted = "";
	        		timeToReadFloor = Math.floor(timeToReadMin);
	        		if (timeToReadFloor > 0) {
	        			timeToReadFormatted = timeToReadFloor + " min";	
	        		}

	        		var remaining = timeToReadMin - timeToReadFloor;
	        		if (remaining > 0) {
	        			if (timeToReadFormatted.length > 0) {
	        				timeToReadFormatted += " ";
	        			}
	        			timeToReadFormatted += Math.round(remaining * 60) + " sec";
	        		}

                    if (timeToReadFormatted.length == 0) {
                        timeToReadFormatted = "0 sec"
                    }

		        	document.getElementById(mainDivID).textContent = wordCount + " word" + (wordCount == 1 ? "" : "s") + " – " + timeToReadFormatted + " to read";
		        	$('#'+mainDivID).css('color', ColorForTimeInSec(timeToReadMin * 60));
					timeOutID = null;
	        	},200);
        	}
		}
	});
});

var warningChecker;
var observer;

chrome.runtime.onMessage.addListener(function(request, sender, response){
	var blacklist;
	if (request.message == 'Update_BlackList') {
		if (!request.blacklist) {
			blacklist = [];
		} else {
			blacklist = request.blacklist.split(", ");
		}

		warningChecker = new WarningChecker(GenerateWarnings(blacklist));
		checkForWarnings(warningChecker);
	} else if (request.message == "isEnabled") {
		if (request.isEnabled === "false") {
			DisableWarnings();
		} else {
			EnableWarnings();
		}
	}
});	

chrome.runtime.sendMessage({message: "GetData"}, function(response){
	var blacklist;
	if (!response.blacklist) {
		blacklist = [];
	} else {
		blacklist = response.blacklist.split(", ");
	}

	warningChecker = new WarningChecker(GenerateWarnings(blacklist));

	observer = new MutationObserver(function(mutation) {
		if (document.querySelector('div[contentEditable=true]')) {
			addTextEventListener(mutation);
			removeTextEventListener();
		}
	});

	observer.observe(document, {characterData: true, subtree: true})
});

function GenerateWarnings(blacklist){
	var data = {warnings:[]};
	blacklist.forEach(function(word){
		item = {
			keyword: word,
			message: "This word is blocked by TinyMails"
		}
		data.warnings.push(item);
	});

	return data;
}

function EnableWarnings(){
	$(".jns-warning-disabled").each(function(index, element){
		$(element).removeClass("jns-warning-disabled");
		$(element).addClass("jns-warning");
	});
}

function DisableWarnings(){
	$(".jns-warning").each(function(index, element){
		$(element).addClass("jns-warning-disabled");
		$(element).removeClass("jns-warning");
	});
}