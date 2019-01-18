function loadProductList() {
    request('GET', '/product', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#comboProducts").append('<option value="' + res[i]._id + '" data-icon="' + res[i].image + '" class="right">' + res[i].name + ' (' + res[i].stock + ' units)' + '</option>');
        }
        $('select').formSelect();
    });
}

loadProductList();

function sendStock() {
    const e = document.getElementById("comboProducts");
    const idProduct = e.options[e.selectedIndex].value;

    const stock = $('#productStock').val();
    const formData = { "stock": stock };

    request('POST', '/product/addStock/' + idProduct, formData, (res) => {
        resetFields();
        M.toast({html: 'Stock added', classes: 'green'});
    });
}

function resetFields() {
    $("#comboProducts").empty();
    $("#comboProducts").append('<option class="right" disabled selected>...</option>');
    loadProductList();
    $('#productStock').val("");
}
