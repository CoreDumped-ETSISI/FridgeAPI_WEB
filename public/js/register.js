
let croppieObj;

initFileInput('avatarImage', 'fileElem');

function handleFiles(files, id) {
    handleImages(files, id, null, (file, croppieInstance) => {
        if(!file) M.toast({html: 'Invalid image', classes: 'red'});
        croppieObj = croppieInstance;
    })
}

function register() {
    const email = $('#email').val();
    const name = $('#displayName').val();
    const password = $('#password').val();
    const repassword = $('#rePassword').val();

    if (password === "" || repassword === "") {
        M.toast({html: 'Insert your new password', classes: 'red'});
    } else if (password !== repassword) {
        M.toast({html: 'Passwords must match', classes: 'red'});
    } else if (password.length < 8) {
        M.toast({html: 'Password is too short (min. 8 characters)', classes: 'red'});
    } else {
        getFinalImage(croppieObj, (image) => {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("displayName", name);
            formData.append("password", password);
            formData.append("avatarImage", image);

            requestXhr('POST', "/signUp", formData, (res) => {
                M.toast({html: 'User created', classes: 'green'});
                delayedRedirect('./login');
            });

            return false;
        });
    }
}

