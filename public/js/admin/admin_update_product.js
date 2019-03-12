
let croppieObj;

initFileInput('productImage', 'fileElem');

loadProductList();

function loadProductList() {
    request('GET', '/product', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#comboProducts").append(
                `<option value="${res[i]._id}" data-icon="${res[i].image}?lastmod=${Date.now()}">
                    ${res[i].name} (${res[i].price} €)
                </option>`);
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
        formData.append("units", $('#productUnits').val());
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
    $('#productUnits').val("");
    $('#productImage').attr("src", "/images/default-product-image.jpg");

    cleanAndAppend("#comboProducts", '<option class="right" disabled selected>...</option>');
    loadProductList();

    if (croppieObj){
        croppieObj.destroy();
        cleanAndAppend('#imageRow', `<img class="circle responsive-img col s10 offset-s1 m6 offset-m3 l8 offset-l2" id="productImage" src="/images/default-product-image.jpg" style="object-fit: cover; padding: 0;">
            <input id="fileElem" type="file" accept="image/*" style="display:none" onchange="handleFiles(this.files,'productImage')">`);
        initFileInput("productImage", "fileElem");
    }
}
