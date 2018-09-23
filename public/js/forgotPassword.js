const settings = {
    "async": true,
    "crossDomain": true,
    "url": config.host() + "/restorePassword",
    "method": "POST",
    "headers": {
        "content-type": "application/x-www-form-urlencoded"
    }
};

function recover(){
    const email = $('#email').val();
    if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
    {
        settings.data = { email : email };

        $.ajax(settings).done(function (response) {
            console.log(response);

            Materialize.toast('Okey. We will send you a mail to this email ', 4000);

            setTimeout(()=>{ window.location.replace("./login") }, 4000);
        }).fail(function (xhr, textStatus, errorThrown) {
            toLogin(xhr.status);
            Materialize.toast('Something went wrong :(', 4000); 
        });
    }
    else{
        Materialize.toast('Please enter a valid email', 4000)
    }
}