function login() {
    const email = $('#email').val();
    const password = $('#password').val();

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return M.toast({
        html: 'Please enter a valid email',
        classes: 'red'
    });
    if (!/\w{8,32}/.test(password)) return M.toast({
        html: 'Passwords must be at least 8 characters long',
        classes: 'red'
    });

    const data = {
        email: email,
        password: password,
        sessionOnly: document.getElementById("remember-me").checked
    };

    request('POST', '/login', data, (res) => {
        if (res.isAdmin)
            delayedRedirect('/admin', 100);
        else
            delayedRedirect('/store', 100);
    });
}

$("#password").keyup(function (event) {
    if (event.keyCode === 13) {
        $("#login").click();
    }
});
