
verify();

function collectTokens(){
    const token = window.location.href.split("=");
    return token[token.length-1];
}

function verify(){
    const url = '/verifyEmail?token=' + collectTokens();
    request('POST', url, null, (res) => {
        M.toast({html:'Email verified', classes: 'green'});
        delayedRedirect('/login',4000);
    });
}
