let productList;

let cart = [];
let total = 0;

initPage();

function initPage() {
    getProductList();
    listIsEmpty();
}

function getProductList() {
    request('GET', 'product/in-stock', null, (res) => {
        productList = JSON.parse(JSON.stringify(res));

        createProductCards();
        //loadCart();
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
    return '<div class="col s6 m4 l3 xl2">' +
        '<div class="card scale-transition waves-effect waves-light scale-out">' +
        '<div id="' + product._id + '" class="card-image" onclick="addToCart(\'' + product._id + '\')">' +
        '<img src="' + product.image + '" />' +
        '<span class="card-title" id="product-name">' + product.name + '</span>' +
        '<span class="new badge" id="product-stock" data-badge-caption=" en stock ">' + product.stock + '</span>' +
        '<a class="btn red" id="product-price">' + product.price + '€</a></div></div></div>'
}

function addToCart(id) {
    let productStock = $('#' + id).find('.badge');
    let stock = parseInt(productStock.text());
    if (stock > 0) {
        $("#empty").empty();

        let product = productList.filter((elem) => {
            return elem._id === id;
        })[0];
        cart.push(product);
        updateStock(id, -1);

        createCartElement(product, (cart.length - 1));
        reloadCart();
    }
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

    reloadCartCost();
}

function createCartElement(product, index) {
    $("#cartList").append('<li class="cartElement valign-wrapper">' +
        '    <img class="responsive-img" src="' + product.image + '" style="width: 15%; margin-left: 5%; object-fit: contain;">' +
        '    <span style="width: 65%; padding-left: 1em;">' + product.name + '</span>' +
        '    <i class="material-icons" onclick="eraseCartElement(\'' + product._id + '\','+ index +')" style="cursor: pointer;">clear</i>' +
        '</li>');
}

function eraseCartElement(id, index) {
    cart.splice(index, 1);
    updateStock(id, 1);
    reloadCart();
}

function updateStock(productId, quantity) {
    let productStock = $('#' + productId).find('.badge');
    let stock = parseInt(productStock.text());
    if (stock > 0)
        productStock.text(stock + quantity);
}

function reloadCartCost() {
    const totalElem = $("#total");
    totalElem.empty();
    total = 0;

    for (let i = 0; i < cart.length; i++) {
        total += cart[i].price;
    }

    totalElem.append((Math.round(total * 100) / 100) + ' €');
}

function purchase() {
    if (cart.length > 0) {
        if ((Math.round(total * 100) / 100) <= (Math.round(user.balance * 100) / 100)) {
            let itemChain = "";

            for (let i = 0; i < cart.length - 1; i++)
                itemChain += cart[i]._id + ",";
            itemChain = itemChain + cart[cart.length - 1]._id;

            const data = {productList: itemChain};

            request('POST', '/purchase', data, (res) => {
                cart = [];
                reloadCart();
                getProfile();
                getProductList();
                M.toast({html: 'Su compra se ha realizado correctamente', classes: 'green'});
            });
        } else {
            M.toast({html: 'No tienes saldo suficiente para efectuar la compra', classes: 'orange'});
        }
    } else {
        M.toast({html: 'El carrito está vacío', classes: 'orange'});
    }
}

function listIsEmpty() {
    $("#cartList").append('<span id="empty" style="width: 100%; color:#aaa;">No hay productos en el carrito :(</span>');
}