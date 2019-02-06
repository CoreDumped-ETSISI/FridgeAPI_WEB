
let croppieObj;

initFileInput('productImage', 'fileElem');

loadProductList();

function loadProductList() {
    request('GET', '/product', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#comboProducts").append('<option value="' + res[i]._id + '" data-icon="' + res[i].image + '" class="right">' + res[i].name + ' (' + res[i].price + '€)' + '</option>');
        }
        $('select').formSelect();
    });
}

function handleFiles(files, id) {
    handleImages(files, id, null, (file, croppieInstance) => {
        if(!file) M.toast({html: 'Invalid image', classes: 'red'});
        croppieObj = croppieInstance;
    })
}


function sendStock() {
    getFinalImage(croppieObj, (image) => {
        const e = document.getElementById("comboProducts");
        const idProduct = e.options[e.selectedIndex].value;

        const formData = new FormData();
        formData.append("name", $('#productName').val());
        formData.append("stock", $('#productStock').val());
        formData.append("price", $('#productPrice').val());
        formData.append("units", "1");
        formData.append("image", image);

        requestXhr('PATCH', '/product/' + idProduct, formData, (res) => {
            resetFields();
            M.toast({html: 'Product updated', classes: 'green'});
        });

        return false;
    });
}

function resetFields() {
    $('#productName').val("");
    $('#productStock').val("");
    $('#productPrice').val("");
    $('#productImage').attr("src", "/images/default-product-image.jpg");
    if (croppieObj) croppieObj.destroy();
}
