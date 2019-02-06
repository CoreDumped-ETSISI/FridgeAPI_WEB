let instance;

let lastPurchasesList;

initPage();

function initPage() {

    let elem = document.querySelector('.collapsible.expandable');
    instance = M.Collapsible.init(elem, {
        accordion: false
    });

    getLastPurchasesList();
    setInterval(getLastPurchasesList, 2000);
}

function getLastPurchasesList() {
    request('GET', 'purchase/recents', null, (res) => {
        if(!lastPurchasesList || !lastPurchasesList[0] || res[0]._id !== lastPurchasesList[0]._id) {
            lastPurchasesList = res;
            let purchaseList = $("#purchaseList");
            purchaseList.empty();
            for (let i = 0; i < res.length; i++) {
                purchaseList.append(purchaseElement(res[i]));
                instance.open(i);
            }
        }
    });
}

function tableHeader(itemName){
    return `<table><thead><tr>
        <td></td>
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

    let temp = `<li class="collapsible-container">
    <div class="collapsible-header">
    <img class="circle" width="48" style="width:48px; height: 48px;" src="${purchase.userId.avatarImage}"/><p style="padding-left: 10px;"><b>${purchase.userId.displayName}</b> ${datetime} Amount: ${purchase.amount.toFixed(2)} € </p></div>
    <div class="collapsible-body">`;

    if(purchase.offerList.length > 0){
        temp += tableHeaderOffer();

        for (let e = 0; e < purchase.offerList.length; e++) {
            let product = purchase.offerList[e].offer;
            product.quantity = purchase.offerList[e].quantity;

            temp += '<tr>' +
                '<td><img  class="circle" width="250" src="' + product.image + '" style="width:48px;"></td>' +
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
                '<td><img  class="circle" width="250" src="' + product.image + '" style="width:48px;"></td>' +
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