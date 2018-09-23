
function recover(){
    const email = $('#email').val();
    if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
    {
        const data = { email : email };

        request('POST', '/restorePassword', data, (res) => {
            M.toast({html: 'Ok! Search the message in your email inbox', classes: 'green'});

            delayedRedirect('/login', 4000);
        });
    }
    else{
        M.toast({html: 'Please enter a valid email', classes: 'red'});
    }
}