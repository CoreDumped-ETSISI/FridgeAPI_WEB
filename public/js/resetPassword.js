const settings = {
    "async": true,
    "crossDomain": true,
    "url": config.host() + "/resetPassword?" + collectTokens(),
    "method": "POST",
    "headers": {
        "content-type": "application/x-www-form-urlencoded"
    }
};

function collectTokens() {
    const token = window.location.href.split("?");
    return token[token.length - 1];
}

function reset() {
    const password = $('#password').val();
    const repassword = $('#rePassword').val();

    if (password === "" || repassword === "") {
        Materialize.toast('Please enter a password', 4000);
    } else if (password !== repassword) {
        Materialize.toast("The passwords doesn't match", 4000);
    } else if (password.length < 8) {
        Materialize.toast('Password must have eight characters', 4000);
    } else {
        settings.data = {password: password};

        $.ajax(settings).done(function (response) {
            console.log(response);

            Materialize.toast('Password changed', 4000);

            setTimeout(() => {
                window.location.replace("./login")
            }, 4000);
        }).fail(function (xhr, textStatus, errorThrown) {
            toLogin(xhr.status);
            Materialize.toast('Something went wrong :(', 4000);
        });
    }
}
