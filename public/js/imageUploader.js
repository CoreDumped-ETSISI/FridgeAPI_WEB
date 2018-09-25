
function initFileInput(fileSelectableId, fileButtonId){
    const fileSelect = $("#" + fileSelectableId);
    const fileElem = $("#" + fileButtonId);
    fileSelect.click(function () {
        fileElem.click();
    });
}

function check_image_type(file) {
    const extension = file.substr((file.lastIndexOf('.') + 1));
    return extension === 'jpg' ||
        extension === 'jpeg' ||
        extension === 'gif' ||
        extension === 'png';
}

function handleImages(files, idElem, config, next) {
    let cropImg;
    let file = files[0];

    if (!file.type.startsWith('image/') || !check_image_type(file.name)) {
        next();
    }

    let img = document.getElementById(idElem);
    img.classList.add("obj");
    img.file = file;
    const imageFile = file;

    const reader = new FileReader();
    reader.onload = (function (aImg) {
        return function (e) {
            aImg.src = e.target.result;
        };
    })(img);
    reader.readAsDataURL(file);

    setTimeout(() => {
        const el = document.getElementById(idElem);
        const conf = (!config) ? {
            viewport: {width: 256, height: 256},
            boundary: {width: 300, height: 300},
            showZoomer: false
        } : config;
        cropImg = new Croppie(el,conf);
        next(imageFile, cropImg);
    }, 100);
}

function getFinalImage(croppieObj, next){
    if(croppieObj){
        croppieObj.result('blob').then((blob) => {
            next(blob);
        })
    } else {
        next();
    }
}

function requestXhr(method, path, data, next) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, path, true);
    xhr.onload = function (e) {
        switch (xhr.status) {
            case 200:
            case 201:
                next(xhr.response);
                break;
            case 401:
                redirect('/login');
                break;
            default:
                let msg = xhr.response.message;
                M.toast({html: (msg)?msg:'Something go wrong with the upload', classes: "red"});
                break;
        }

    };
    xhr.send(data);
    return false;
}