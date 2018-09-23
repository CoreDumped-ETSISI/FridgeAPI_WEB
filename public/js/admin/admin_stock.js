loadProductList();

function loadProductList() {
    request('GET', '/product', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#comboProducts").append('<option value="' + res[i]._id + '" data-icon="' + res[i].image +'" class="right">' + res[i].name + ' (' + res[i].price + '€)' + '</option>');
        }
        $('select').formSelect();
    });
}

function sendStock() {
    const e = document.getElementById("comboProducts");
    const idProduct = e.options[e.selectedIndex].value;
    const name = $('#productName').val();
    const stock = $('#productStock').val();
    const price = $('#productPrice').val();
    const units = $('#productUnits').val();
    const data = {
        name: name,
        stock: stock,
        price: price,
        units: units
    };
    request('PATCH', '/product/' + idProduct, data, (res) => {
        M.toast({html: 'Product updated', classes: "green"});
    });
}