const ApiURL = 'http://localhost:3000';

let productList;

let cart = [];
let total = 0;

initPage();

function initPage() {
    getProductList();
    listIsEmpty();
}

function getProductList() {
    request('GET', `${ApiURL}/product`, null, (res) => {
        productList = JSON.parse(JSON.stringify(res));

        createProductCards();
    });
}

function createProductCards() {
    const products = $("#products");
    products.empty();

    for (let i = 0; i < productList.length; i++) {
        products.append(productCard(productList[i]));
    }
    setTimeout(() => {
        $('.scale-out').toggleClass('scale-out', 'scale-in');
    }, 500);
}

function productCard(product) {
    return '<div class="col s6 m4">' +
        '<div class="card scale-transition waves-effect waves-green scale-out product-item">' +
        '<div id="' + product._id + '" class="card-image" onclick="addToCart(\'' + product._id + '\')">' +
        '<img src="' + product.image + '" />' +
        '<span class="card-title" id="product-name">' + product.name + '</span></div></div></div>'
}

function listIsEmpty() {
    $("#cartList").append('<span id="empty" style="width: 100%; color:#aaa;">No hay productos en la oferta :(</span>');
}

function addToCart(id) {
    $("#empty").empty();

    let product = productList.filter((elem) => {
        return elem._id === id;
    })[0];
    cart.push(product);

    M.toast({html: `${product.name} añadido al carrito`, classes: 'blue'});
    createCartElement(product, (cart.length - 1));
    reloadCart();
}

function eraseCartElement(index, name) {
    M.toast({html: `${name} eliminado del carrito`, classes: 'blue'});
    cart.splice(index, 1);
    reloadCart();
}

function reloadCart() {
    $("#cartList").empty();

    if (cart.length === 0) {
        listIsEmpty();
    }
    else {
        for (let i = 0; i < cart.length; i++) {
            createCartElement(cart[i], i);
        }
    }
}

function createCartElement(product, index) {
    $("#cartList").append('<li class="cartElement valign-wrapper">' +
        '    <img class="responsive-img" src="' + product.image + '" style="width: 15%; margin-left: 5%; object-fit: contain;">' +
        '    <span style="width: 65%; padding-left: 1em;">' + product.name + '</span>' +
        '    <i class="material-icons" onclick="eraseCartElement('+ index + ',\''+ product.name +'\')" style="cursor: pointer;">clear</i>' +
        '</li>');
}