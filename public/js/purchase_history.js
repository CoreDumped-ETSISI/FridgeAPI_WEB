initPage();

$(document).ready(function () {
    $('.collapsible').collapsible();
});

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

function tableHeader(itemName){
    return `<table><thead><tr>
        <td class="invisible"></td>
        <td>${itemName}</td>
        <td>Quantity</td>
        <td>Unit price</td>
        <td>Total price</td>
        </tr></thead>`;
}

function tableHeaderProduct(){
    return tableHeader("Product");
}

function tableHeaderOffer(){
    return tableHeader("Offer");
}

const tableFooter = '</table>';
const collapsibleFooter = '</div></li>';

function purchaseElement(purchase) {
    const datetime = new Date(purchase.timestamp).toLocaleString('es-ES');

    let temp = '<li>' +
        '<div class="collapsible-header"><i class="material-icons">shopping_cart</i>' + datetime + ' Amount: ' + purchase.amount.toFixed(2) + ' €</div>' +
        '<div class="collapsible-body">';

    if(purchase.offerList.length > 0){
        temp += tableHeaderOffer();

        for (let e = 0; e < purchase.offerList.length; e++) {
            let product = purchase.offerList[e].offer;
            product.quantity = purchase.offerList[e].quantity;

            temp += '<tr>' +
                '<td class="invisible"><img class="circle" width="250" src="' + product.image + '" style="width:48px;"></td>' +
                '<td>' + product.name + '</td>' +
                '<td>' + product.quantity + '</td>' +
                '<td>' + product.price.toFixed(2) + ' €</td>' +
                '<td>' + (product.price * product.quantity).toFixed(2) + ' €</td>' +
                '</tr>'
        }

        temp += tableFooter;
    }

    if(purchase.productList.length > 0){
        temp += tableHeaderProduct();

        for (let e = 0; e < purchase.productList.length; e++) {
            let product = purchase.productList[e].product;
            product.quantity = purchase.productList[e].quantity;

            temp += '<tr>' +
                '<td class="invisible"><img class="circle" width="250" src="' + product.image + '" style="width:48px;"></td>' +
                '<td>' + product.name + '</td>' +
                '<td>' + product.quantity + '</td>' +
                '<td>' + product.price.toFixed(2) + ' €</td>' +
                '<td>' + (product.price * product.quantity).toFixed(2) + ' €</td>' +
                '</tr>'
        }

        temp += tableFooter;
    }
    
    return temp + collapsibleFooter;
}