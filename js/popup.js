var switchery, txt_words, btn_apply;

window.onload = function(){
    initComponent();
    initEventHandler();
}

function initComponent(){
    switchery = document.querySelector(".js-switch");
    switchery.checked = localStorage.getItem("isEnabled") === "true"? true: false;
    Switchery(switchery);
    txt_words = $("#txt_words").tokenfield();
    btn_apply = document.getElementById("btn_apply");
    txt_words.tokenfield("setTokens", localStorage.getItem("blacklist"));
}

function initEventHandler(){
    switchery.onchange = ChangeState;
    btn_apply.onclick = Apply;
}

function Apply(){
    localStorage.setItem("blacklist", txt_words.val());
}

function ChangeState(){
    if (switchery.checked) {
        txt_words.tokenfield("enable");
        btn_apply.classList.remove("disabled");
    } else {
        txt_words.tokenfield("disable");
        btn_apply.classList.add("disabled");
    }

    localStorage.setItem("isEnabled", switchery.checked);
}


