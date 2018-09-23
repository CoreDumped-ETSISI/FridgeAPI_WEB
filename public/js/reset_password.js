
function collectTokens() {
    const token = window.location.href.split("?");
    return token[token.length - 1];
}

function reset() {
    const password = $('#password').val();
    const repassword = $('#rePassword').val();

    if (password === "" || repassword === "") {
        M.toast({html:'Insert your new password', classes: 'red'});
    } else if (password !== repassword) {
        M.toast({html:'Passwords don\'t match', classes: 'red'});
    } else if (password.length < 8) {
        M.toast({html:'Password is too short (min. 8 characters)', classes: 'red'});
    } else {
        const data = {
            password: password
        };

        const url = '/resetPassword?' + collectTokens();
        request('POST', url, data, (res) => {
            M.toast({html:'Password updated', classes: 'green'});
            delayedRedirect('/login',4000);
        });
    }
}
