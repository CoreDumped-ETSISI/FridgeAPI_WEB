
let croppieObj;

initFileInput('productImage', 'fileElem');

function handleFiles(files, id) {
    handleImages(files, id, null, (file, croppieInstance) => {
        if(!file) M.toast({html: 'Invalid image', classes: 'red'});
        croppieObj = croppieInstance;
    })
}

function addProduct() {
    getFinalImage(croppieObj, (image) => {
        const formData = new FormData();
        formData.append("name", $('#productName').val());
        formData.append("stock", $('#stock').val());
        formData.append("price", $('#marketPrice').val());
        formData.append("image", image);

        requestXhr('POST', '/product', formData, (res) => {
            resetFields();
            M.toast({html: 'Product created', classes: 'green'});
        });
    });
}

function resetFields() {
    $('#productName').val("");
    $('#stock').val("");
    $('#marketPrice').val("");
    $('#productImage').attr("src", "/images/default-product-image.jpg");
    if(croppieObj) croppieObj.destroy();
}
