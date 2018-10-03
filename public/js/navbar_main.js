let croppieObj;

let user = getProfile();

initFileInput('userImage', 'fileElem');

function handleFiles(files, id) {
    const config = {
        viewport: {width: 256, height: 256, type: 'circle'},
        boundary: {width: 300, height: 300},
        showZoomer: false
    };
    handleImages(files, id, config, (file, croppieInstance) => {
        if (!file) M.toast({html: 'Invalid image', classes: 'red'});
        croppieObj = croppieInstance;
    })
}

function saveUser() {
    const name = $('#user_name').val();
    const password = $('#user_pass').val();
    const repassword = $('#user_repass').val();

    if (password !== "" || repassword !== "") {
        if (password !== repassword) {
            return M.toast({html: 'Passwords must match', classes: 'red'});
        }
        if (password.length < 8) {
            return M.toast({html: 'Password is too short (min. 8 characters)', classes: 'red'});
        }
    }
    getFinalImage(croppieObj, (image) => {
        const formData = new FormData();
        formData.append("displayName", name);
        formData.append("password", password);
        formData.append("avatarImage", image);

        requestXhr('PATCH', '/user', formData, (res) => {
            resetFields();
            reload();
            M.toast({html: 'User updated', classes: 'green'});
        });

        return false;
    });
}

function resetFields() {
    $('#user_name').val('');
    $('#user_pass').val('');
    $('#user_repass').val('');
    $('#userImage').attr("src", "/images/default-product-image.jpg");
    if (croppieObj) croppieObj.destroy();
}

function deleteCredentials() {
    request('GET', '/logout', null, (res) => {
        redirect("/login");
    })
}