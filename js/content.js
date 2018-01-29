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
	var len_before = len_after = 0;
	var isUpdated_Blacklist = false;
	var composeViewEl = null;

	// the SDK has been loaded, now do something with it!
	SDK.Compose.registerComposeViewHandler(function(composeView){
        var timeOutID;
		var readingSpeedWPM = 190;
		var mainDivID = 'wse_main_' + composeCount;
		composeViewEl = composeView;

		var statusBar = composeView.addStatusBar({
			height: 21
		});

		statusBar.el.innerHTML = "<div class='wse-main' id='"+ mainDivID + "'></div>";
		
		$(composeView.getBodyElement()).bind('DOMSubtreeModified', ChangeMailContent);

		composeCount++;
		
		function ChangeMailContent(e){
			if (e.target.innerHTML.length == 0) return;

			len_before = e.target.innerHTML.length;

			if (len_before != len_after || isUpdated_Blacklist) {
				chrome.runtime.sendMessage({message: "GetData"}, function(response){
					var blacklist;
					if (!response.blacklist) {
						blacklist = [];
					} else {
						blacklist = response.blacklist.split(", ");
					}
	
					if (response.isEnabled === "true") {
						Update(blacklist, true);
					} else {
						Update(blacklist, false);
					}

					len_after = e.target.innerHTML.length;
					isUpdated_Blacklist = false;
				});
			}
		}

		function Update(blacklist, isEnabled) {
        	if (timeOutID == null) {
	        	timeOutID = window.setTimeout(function(){
					var bodyElement = $(composeView.getBodyElement()).clone();
		        	$(bodyElement).find('div[data-smartmail="gmail_signature"]').remove();

					var bodyText = $(bodyElement).text().trim();
					var words;
					var wordCount;
					
		        	if (bodyText.length == 0) {
						words = [];
		        		wordCount = 0;
		        	} else {
						words = bodyText.split(/\s+/);
			        	wordCount = words.length;
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

					var htmlContent = $(composeView.getBodyElement()).html();
					htmlContent = ReplaceAll(htmlContent, '<label class="lbl-blocked-word">', '');
					htmlContent = ReplaceAll(htmlContent, '<label class="">', '');
					htmlContent = ReplaceAll(htmlContent, '</label>', '');
					$(composeView.getBodyElement()).empty();
					
					if (isEnabled) {
						$("#" + mainDivID).show();
					} else {
						$("#" + mainDivID).hide();
					}
					
					blacklist.forEach(function(word){
						var index = htmlContent.indexOf(word);
						if (index > -1) {
							if (isEnabled) {
								htmlContent = ReplaceAll(htmlContent, word, '<label class="lbl-blocked-word">' + word + '</label>');
							} else {
								htmlContent = ReplaceAll(htmlContent, word, '<label class="">' + word + '</label>');
							}
						}
					});
				
					$(composeView.getBodyElement()).append(htmlContent);
					PlaceCaretAtEnd($(composeView.getBodyElement()).get(0));
	        	},200);
        	}
		}

		function PlaceCaretAtEnd(el) {
			el.focus();
			if (typeof window.getSelection != 'undefined'
					&& typeof document.createRange != 'undefined') {
				var range = document.createRange();
				range.selectNodeContents(el);
				range.collapse(false);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			} else if (typeof document.body.createTextRange != 'undefined') {
				var textRange = document.body.createTextRange();
				textRange.moveToElementText(el);
				textRange.collapse(false);
				textRange.select();
			}
		}

		function ReplaceAll(str, substr, newstr) {
			str = str.replace(new RegExp(substr, 'g'), newstr);
			return str;
		}
	});

	chrome.runtime.onMessage.addListener(function(request, sender, response){
		if (request.message == 'Update_BlackList' && composeViewEl != null) {
			isUpdated_Blacklist = true;
			$(composeViewEl.getBodyElement()).trigger('DOMSubtreeModified');
		}
	});	
});