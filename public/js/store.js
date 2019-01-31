let productList;

let cart = [];
let offers = [];
let total = 0;

initPage();

function initPage() {
    getProductList();
    getOfferList();
    listIsEmpty();
}

function getOfferList() {
  request('GET', 'offer/in-stock', null, (res) => {
      offerList = JSON.parse(JSON.stringify(res));

      createOfferCards();
  });
}

function getProductList() {
    request('GET', 'product/in-stock', null, (res) => {
        productList = JSON.parse(JSON.stringify(res));

        createProductCards();
    });
}

function createProductCards() {
    const products = $("#products");
    products.empty();

    if (productList.length > 0) {
      products.append(title('Productos'));
    }

    for (let i = 0; i < productList.length; i++) {
        products.append(productCard(productList[i]));
    }

    setTimeout(() => {
        $('.scale-out').toggleClass('scale-out', 'scale-in');
    }, 500);
}

function createOfferCards() {
    const offers = $("#offers");
    offers.empty();

    if (offerList.length > 0) {
      offers.append(title('Ofertas'));
    }

    for (let i = 0; i < offerList.length; i++) {
      offers.append(offerCard(offerList[i]));
    }

    setTimeout(() => {
        $('.scale-out').toggleClass('scale-out', 'scale-in');
    }, 500);
}

function productCard(product) {
  return card(product, 'addToCart');
}

function offerCard(offer) {
  return card(offer, 'addOfferToCart');
}

function card(product, funcName) {
  return `<div class="col s6 m4 l3 xl2">
          <div class="card scale-transition waves-effect waves-green scale-out product-item">
          <div id="${product._id}" class="card-image" onclick="${funcName}('${product._id}')">
          <img src="${product.image}"/>
          <span class="card-title" id="product-name">${product.name}</span>
          <span class="new badge" id="product-stock" data-badge-caption=" UDS ">${product.stock}</span>
          <a class="btn red" id="product-price">${product.price}€</a></div></div></div>`
}

function title(name) {
  return `<div class="scale-out scale-transition">
          <h5>${name}</h5>
          <div class="divider"></div>
          </div><br>`
}

function addOfferToCart(id) {
    let offer = offerList.filter((elem) => {
        return elem._id === id;
    })[0];

    offers.push(offer);

    for (let i = 0; i < offer.products.length; i++){

      updateStock(offer.products[i].product._id, -offer.products[i].quantity);
    }

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

        M.toast({html: `${product.name} añadido al carrito`, classes: 'blue'});
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
        '    <i class="material-icons" onclick="eraseCartElement(\'' + product._id + '\','+ index + ',\''+ product.name +'\')" style="cursor: pointer;">clear</i>' +
        '</li>');
}

function eraseCartElement(id, index, name) {
    M.toast({html: `${name} eliminado del carrito`, classes: 'blue'});
    cart.splice(index, 1);
    updateStock(id, 1);
    reloadCart();
}

function updateStock(productId, quantity) {
    let productStock = $('#' + productId).find('.badge');
    let stock = parseInt(productStock.text());
    if (stock >= 0)
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
        //if ((Math.round(total * 100) / 100) <= (Math.round(user.balance * 100) / 100)) {
            let itemChain = "";
            let offerItemChain = "";

            for (let i = 0; i < cart.length - 1; i++)
                itemChain += cart[i]._id + ",";
            itemChain = itemChain + cart[cart.length - 1]._id;

            const data = {productList: itemChain, offerList: offerItemChain};

            request('POST', '/purchase', data, (res) => {
                cart = [];
                reloadCart();
                getProfile();
                getProductList();
                M.toast({html: 'Su compra se ha realizado correctamente', classes: 'green'});
            });
        /*} else {
            M.toast({html: 'No tienes saldo suficiente para efectuar la compra', classes: 'orange'});
        }*/
    } else {
        M.toast({html: 'El carrito está vacío', classes: 'orange'});
    }
}

function listIsEmpty() {
    $("#cartList").append('<span id="empty" style="width: 100%; color:#aaa;">No hay productos en el carrito :(</span>');
}
