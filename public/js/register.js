
let imageFile;
let cropImg;

const fileSelect = $("#avatarImage");
const fileElem = $("#fileElem");

fileSelect.click(function () {
    fileElem.click();
});

function check_image_type(file) {
    const extension = file.substr((file.lastIndexOf('.') + 1));
    return extension === 'jpg' ||
        extension === 'jpeg' ||
        extension === 'gif' ||
        extension === 'png';
}

function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
        let file = files[i];

        if (!file.type.startsWith('image/')) {
            continue;
        }

        let img = document.getElementById("avatarImage");
        img.classList.add("obj");
        img.file = file;
        imageFile = file;

        const reader = new FileReader();
        reader.onload = (function (aImg) {
            return function (e) {
                aImg.src = e.target.result;
            };
        })(img);
        reader.readAsDataURL(file);
    }
    setTimeout(() => {
        const el = document.getElementById('avatarImage');
        cropImg = new Croppie(
            el,
            {
                viewport: {width: 250, height: 250, type: 'circle'},
                boundary: {width: 300, height: 300},
                showZoomer: false
            }
        );
    }, 100);
}

function register() {
    cropImg.result('blob').then(function (blob) {

        const formData = new FormData();
        formData.append("email", $('#email').val());
        formData.append("displayName", $('#displayName').val());
        formData.append("password", $('#password').val());
        formData.append("avatarImage", blob);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', "/signUp", true);
        xhr.onload = function (e) {
            switch (xhr.status) {
                case 200:
                case 201:
                    M.toast({html: 'User created', classes: 'green'});
                    setTimeout(() => {window.location.replace("./login")}, 2000);
                    break;
                case 409:
                    M.toast({html: 'Already exist a user with this email', classes: 'red'});
                    break;
                default:
                    M.toast({html: 'There was a error with your request', classes: 'red'});
                    break;
            }

        };
        xhr.send(formData);
        return false;
    });
}

