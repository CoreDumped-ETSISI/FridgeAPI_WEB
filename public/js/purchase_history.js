initPage();

function initPage() {
    getPurchaseList();
}

function getPurchaseList() {
    request('GET', '/purchase', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#purchaseList").append(purchaseElement(res[i]));
        }
    });
}

function purchaseElement(purchase) {
    const datetime = new Date(purchase.timestamp).toLocaleString('es-ES');

    let temp = '<li>' +
        '<div class="collapsible-header"><i class="material-icons">shopping_cart</i>' + datetime + ' Amount: ' + purchase.amount.toFixed(2) + ' €</div>' +
        '<div class="collapsible-body">' +
        '<table><thead><tr>' +
        '<td></td>' +
        '<td>Product</td>' +
        '<td>Quantity</td>' +
        '<td>Unit price</td>' +
        '<td>Total price</td>' +
        '</tr></thead>';

    for (let e = 0; e < purchase.productList.length; e++) {
        let product = purchase.productList[e].product;
        product.quantity = purchase.productList[e].quantity;

        temp += '<tr>' +
            '<td><img  class="circle" width="250" src="' + product.image + '" style="width:48px;"></td>' +
            '<td>' + product.name + '</td>' +
            '<td>' + product.quantity + '</td>' +
            '<td>' + product.price + ' €</td>' +
            '<td>' + product.price * product.quantity + ' €</td>' +
            '</tr>'
    }

    temp += '</table></div>' + '</li>';
    return temp;
}