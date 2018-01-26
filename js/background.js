chrome.runtime.onMessage.addListener(HandleMessage);    

localStorage.setItem("isEnabled", true);
localStorage.setItem("blacklist", "");

function HandleMessage(request, sender, reply){
    if (request.message == "GetData"){
        reply({
            "isEnabled": localStorage.getItem("isEnabled"),
            "blacklist": localStorage.getItem("blacklist")
        });
    }
}