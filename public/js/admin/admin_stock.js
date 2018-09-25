let imageFile;
let cropImg;

const fileSelect = $("#productImage");
const fileElem = $("#fileElem");

fileSelect.click(function () {
    fileElem.click();
});

loadProductList();


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

        let img = document.getElementById("productImage");
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
        const el = document.getElementById('productImage');
        cropImg = new Croppie(
            el,
            {
                viewport: {width: 256, height: 256},
                boundary: {width: 300, height: 300},
                showZoomer: false
            }
        );
    }, 100);
}


function loadProductList() {
    request('GET', '/product', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#comboProducts").append('<option value="' + res[i]._id + '" data-icon="' + res[i].image + '" class="right">' + res[i].name + ' (' + res[i].price + '€)' + '</option>');
        }
        $('select').formSelect();
    });
}

function sendStock() {
    if (!cropImg) {
        const e = document.getElementById("comboProducts");
        const idProduct = e.options[e.selectedIndex].value;

        const formData = new FormData();
        formData.append("name", $('#productName').val());
        formData.append("stock", $('#productStock').val());
        formData.append("price", $('#productPrice').val());
        formData.append("units", $('#productUnits').val());

        const xhr = new XMLHttpRequest();
        xhr.open('PATCH', '/product/' + idProduct, true);
        xhr.onload = function (e) {
            switch (xhr.status) {
                case 200:
                case 201:
                    resetFields();
                    M.toast({html: 'Product updated', classes: 'green'});
                    break;
                default:
                    M.toast({html: 'There was a error with your request', classes: 'red'});
                    break;
            }

        };
        xhr.send(formData);
        return false;
    } else {
        cropImg.result('blob').then(function (blob) {
            const e = document.getElementById("comboProducts");
            const idProduct = e.options[e.selectedIndex].value;

            const formData = new FormData();
            formData.append("name", $('#productName').val());
            formData.append("stock", $('#productStock').val());
            formData.append("price", $('#productPrice').val());
            formData.append("units", $('#productUnits').val());
            formData.append("image", blob);

            const xhr = new XMLHttpRequest();
            xhr.open('PATCH', '/product/' + idProduct, true);
            xhr.onload = function (e) {
                switch (xhr.status) {
                    case 200:
                    case 201:
                        resetFields();
                        M.toast({html: 'Product updated', classes: 'green'});
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

}

function resetFields() {
    $('#productName').val("");
    $('#productStock').val("");
    $('#productPrice').val("");
    $('#productUnits').val("");
    $('#productImage').attr("src", "/images/default-product-image.jpg");
    if (cropImg) cropImg.destroy();
}
