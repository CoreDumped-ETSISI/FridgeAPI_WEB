let productList;
let offerList;

let products = [];
let offers = [];
let total = 0;
let buying = false;

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
        products.append(card(productList[i], 'addProductToCart'));
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
      offers.append(card(offerList[i], 'addOfferToCart'));
    }

    setTimeout(() => {
        $('.scale-out').toggleClass('scale-out', 'scale-in');
    }, 500);
}


function card(element, funcName) {
  return `<div class="col s6 m4 l3 xl2">
          <div class="card scale-transition waves-effect waves-green scale-out product-item">
          <div id="${element._id}" class="card-image" onclick="${funcName}('${element._id}')">
          <img src="${element.image}"/>
          <span class="card-title" id="product-name">${element.name}</span>
          <span class="new badge" id="product-stock" data-badge-caption=" UDS ">${element.stock}</span>
          <a class="btn red" id="product-price">${element.price}€</a></div></div></div>`
}

function title(name) {
  return `<div class="scale-out scale-transition">
          <h5>${name}</h5>
          <div class="divider"></div>
          </div><br>`
}

function addOfferToCart(id) {
    let offerStock = parseInt($('#' + id).find('.badge').text());
    if (offerStock > 0) {
        $("#empty").empty();

        let offer = offerList.filter((elem) => {
            return elem._id === id;
        })[0];

        var is_stock = false;
        for (let i = 0; i < offer.products.length; i++){
          let productStock = $('#' + offer.products[i].product._id).find('.badge');
          let stock = parseInt(productStock.text());
          if(stock >= offer.products[i].quantity){ is_stock = true; }
          else { is_stock = false; }
        }

        if (is_stock === true){
          for (let i = 0; i < offer.products.length; i++){
            updateStock(offer.products[i].product._id, -offer.products[i].quantity);
        }
          offers.push(offer);
          updateStock(id, -1);

          M.toast({html: `${offer.name} añadido al carrito`, classes: 'blue'});
          createCartElement(offer, (offers.length - 1), 'eraseOfferElement');
          reloadCart();
        }
      }
}

function addProductToCart(id) {
    let productStock = $('#' + id).find('.badge');
    let stock = parseInt(productStock.text());
    if (stock > 0) {
        $("#empty").empty();

        let product = productList.filter((elem) => {
            return elem._id === id;
        })[0];
        products.push(product);
        updateStock(id, -1);

        M.toast({html: `${product.name} añadido al carrito`, classes: 'blue'});
        createCartElement(product, (products.length - 1), 'eraseProductElement');
        reloadCart();
    }
}

function createCartElement(element, index, eraseFuncName) {
    $("#cartList").append(
     `<li class="cartElement valign-wrapper">
      <img class="responsive-img" src="${element.image}" style="width: 15%; margin-left: 5%; object-fit: contain;">
      <span style="width: 65%; padding-left: 1em;">${element.name}</span>
      <i class="material-icons" onclick="${eraseFuncName}('${element._id}', '${index}', '${element.name}')" style="cursor: pointer;">clear</i>
      </li>`);

}

function eraseProductElement(id, index, name) {
    M.toast({html: `${name} eliminado del carrito`, classes: 'blue'});
    products.splice(index, 1);
    updateStock(id, 1);
    reloadCart();
}

function eraseOfferElement(id, index, name) {
  let offer = offers[index];
  M.toast({html: `${name} eliminado del carrito`, classes: 'blue'});
  for (let i = 0; i < offer.products.length; i++){
    updateStock(offer.products[i].product._id, offer.products[i].quantity);
  }
  updateStock(id, 1);
  offers.splice(index, 1);
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

    for (let i = 0; i < products.length; i++) {
        total += products[i].price;
    }

    for (let i = 0; i < offers.length; i++) {
        total += offers[i].price;
    }

    totalElem.append((Math.round(total * 100) / 100) + ' €');
}

function reloadCart() {
    $("#cartList").empty();

    if (products.length === 0 && offers.length === 0) {
        listIsEmpty();
    }
    else {
        for (let i = 0; i < products.length; i++) {
            createCartElement(products[i], i, 'eraseProductElement');
        }
        for (let i = 0; i < offers.length; i++) {
            createCartElement(offers[i], i, 'eraseOfferElement');
        }
    }

    reloadCartCost();
}

function purchase() {
    if (!buying) {
        if (products.length > 0 || offers.length > 0) {
            let itemChain = "";
            let offerItemChain = "";

            if (products.length > 0){
                for (let i = 0; i < products.length - 1; i++)
                    itemChain += products[i]._id + ",";
                itemChain = itemChain + products[products.length - 1]._id;
            }

            if (offers.length > 0){
                for (let i = 0; i < offers.length - 1; i++)
                    offerItemChain += offers[i]._id + ",";
                offerItemChain = offerItemChain + offers[offers.length - 1]._id;
            }

            const data = {productList: itemChain, offerList: offerItemChain};

            request('POST', '/purchase', data, (res) => {
                products = [];
                offers = [];
                reloadCart();
                getProfile();
                getProductList();
                getOfferList();
                M.toast({html: 'Su compra se ha realizado correctamente', classes: 'green'});
            });
        } else {
            M.toast({html: 'El carrito está vacío', classes: 'orange'});
        }
    } else {
    M.toast({ html: "Compra en proceso", classes: "orange" });
    }
}

function listIsEmpty() {
    $("#cartList").append('<span id="empty" style="width: 100%; color:#aaa;">No hay productos en el carrito :(</span>');
}
