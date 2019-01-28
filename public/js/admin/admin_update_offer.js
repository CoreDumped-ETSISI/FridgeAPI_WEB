
let croppieObj;

initFileInput('productImage', 'fileElem');

loadProductList();

function loadProductList() {
    request('GET', '/offer', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#comboProducts").append('<option value="' + res[i]._id + '" data-icon="' + res[i].image + '" class="right">' + res[i].name + '</option>');
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
    if (cart.length > 0) {
        let itemChain = "";

        for (let i = 0; i < cart.length - 1; i++)
            itemChain += cart[i]._id + ",";
        itemChain = itemChain + cart[cart.length - 1]._id;
    
        getFinalImage(croppieObj, (image) => {
            const e = document.getElementById("comboProducts");
            const idOffer = e.options[e.selectedIndex].value;

            const formData = new FormData();
            formData.append("name", $('#productName').val());
            formData.append("price", $('#productPrice').val());
            formData.append("image", image);
            formData.append("products", itemChain);

            requestXhr('PATCH', '/offer/' + idOffer, formData, (res) => {
                resetFields();
                M.toast({html: 'Offer updated', classes: 'green'});
            });

            return false;
        });
    } else {
        M.toast({html: 'No products in offer', classes: 'orange'});
    }
}

function resetFields() {
    $('#productName').val("");
    $('#productPrice').val("");
    $('#productImage').attr("src", "/images/default-product-image.jpg");
    cart = [];
    reloadCart();
    if(croppieObj) croppieObj.destroy();
}
