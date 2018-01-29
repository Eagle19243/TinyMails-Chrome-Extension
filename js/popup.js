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
}

function Apply(){
    localStorage.setItem("blacklist", txt_words.val());
}

function ChangeState(){
    if (switchery.checked) {
        txt_words.tokenfield("enable");
    } else {
        txt_words.tokenfield("disable");
    }

    localStorage.setItem("isEnabled", switchery.checked);
}


