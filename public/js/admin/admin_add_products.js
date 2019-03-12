
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
    
    if (croppieObj){
        croppieObj.destroy();
        cleanAndAppend("#imageRow", `<img class="circle responsive-img col s10 offset-s1 m6 offset-m3 l8 offset-l2" id="productImage" src="/images/default-product-image.jpg" style="object-fit: cover; padding: 0;">
          <input id="fileElem" type="file" accept="image/*" style="display:none" onchange="handleFiles(this.files,'productImage')">`);
        initFileInput("productImage", "fileElem");
    }
}
