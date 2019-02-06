let croppieObj;

initFileInput('productImage', 'fileElem');

function handleFiles(files, id) {
    handleImages(files, id, null, (file, croppieInstance) => {
        if(!file) M.toast({html: 'Invalid image', classes: 'red'});
        croppieObj = croppieInstance;
    })
}

function addProduct() {
    if (cart.length > 0) {
        let itemChain = "";

        for (let i = 0; i < cart.length - 1; i++)
            itemChain += cart[i]._id + ",";
        itemChain = itemChain + cart[cart.length - 1]._id;

        getFinalImage(croppieObj, (image) => {
            const formData = new FormData();
            formData.append("name", $('#productName').val());
            formData.append("price", $('#marketPrice').val());
            formData.append("image", image);
            formData.append("products", itemChain);
    
            requestXhr('POST', '/offer', formData, (res) => {
                resetFields();
                M.toast({html: 'Offer created', classes: 'green'});
            });
        });
    } else {
        M.toast({html: 'No products in offer', classes: 'orange'});
    }
}

function resetFields() {
    $('#productName').val("");
    $('#marketPrice').val("");
    $('#productImage').attr("src", "/images/default-product-image.jpg");
    cart = [];
    reloadCart();
    if(croppieObj) croppieObj.destroy();
}
