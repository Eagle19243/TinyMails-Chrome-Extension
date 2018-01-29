var switchery, txt_words;

window.onload = function(){
    initComponent();
    initEventHandler();
}

function initComponent(){
    switchery = document.querySelector(".js-switch");
    switchery.checked = localStorage.getItem("isEnabled") === "true"? true: false;
    Switchery(switchery);
    txt_words = $("#txt_words").tokenfield();
    txt_words.tokenfield("setTokens", localStorage.getItem("blacklist"));
}

function initEventHandler(){
    switchery.onchange = ChangeState;
    txt_words.on('tokenfield:createdtoken', Apply);
    txt_words.on('tokenfield:removedtoken', Apply);
    txt_words.on('tokenfield:editedtoken', Apply);
}

function Apply(){
    localStorage.setItem("blacklist", txt_words.tokenfield('getTokensList'));
    chrome.tabs.query({
            active: true, 
            currentWindow: true, 
            url:["https://mail.google.com/*", "https://inbox.google.com/*"]
        },
        function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {message: "Update_BlackList"});
        }
    );
}

function ChangeState(){
    if (switchery.checked) {
        txt_words.tokenfield("enable");
    } else {
        txt_words.tokenfield("disable");
    }

    localStorage.setItem("isEnabled", switchery.checked);
}


