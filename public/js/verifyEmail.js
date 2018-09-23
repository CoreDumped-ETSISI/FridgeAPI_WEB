var settings = {
    "async": true,
    "crossDomain": true,
    "url": config.host() + "/verifyEmail?token=" + collectTokens(),
    "method": "POST",
    "headers": {
        "content-type": "application/x-www-form-urlencoded"
    }
};

function collectTokens(){
    var token = window.location.href.split("=");
    return token[token.length-1];
};

function verify(){
    $.ajax(settings).done(function (response) {
            console.log(response);

            Materialize.toast('Email verified', 4000);

            setTimeout(()=>{ window.location.replace("./login") }, 4000);
    }).fail(function (xhr, textStatus, errorThrown) {
        toLogin(xhr.status); 
        Materialize.toast('Something went wrong :(', 4000); 
    });
}
