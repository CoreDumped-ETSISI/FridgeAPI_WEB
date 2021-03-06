let offers;
let croppieObj;

initFileInput("productImage", "fileElem");

loadProductList();

$("#comboProducts").on("change", function() {
  new Promise((resolve, reject) => {
    resolve(resetFields());
  }).then(response => {
    loadOfferProducts();
  });
});

function loadProductList() {
  request("GET", "/offer", null, res => {
    offers = res;
    for (let i = 0; i < res.length; i++) {
      $("#comboProducts").append(
        `<option value="${res[i]._id}" data-icon="${res[i].image}?lastmod=${Date.now()}">
          ${res[i].name} (${res[i].price} €)
        </option>`
      );
    }
    $("select").formSelect();
  });
}

function loadOfferProducts() {
  let offerId = document.getElementById("comboProducts").value;
  if (offerId) {
    for (let x = 0; x < offers.length; x++) {
      if (offerId === offers[x]._id) {
        sentinel = true;
        let products = offers[x].products;
        products.forEach(prod => {
          for (let i = 0; i < prod.quantity; i++) {
            addToCart(prod.product._id);
          }
        });
      }
    }
  }
}

function handleFiles(files, id) {
  handleImages(files, id, null, (file, croppieInstance) => {
    if (!file) M.toast({ html: "Invalid image", classes: "red" });
    croppieObj = croppieInstance;
  });
}

function sendStock() {
  if (cart.length > 0) {
    let itemChain = "";

    for (let i = 0; i < cart.length - 1; i++) itemChain += cart[i]._id + ",";
    itemChain = itemChain + cart[cart.length - 1]._id;

    getFinalImage(croppieObj, image => {
      const e = document.getElementById("comboProducts");
      const idOffer = e.options[e.selectedIndex].value;

      const formData = new FormData();
      formData.append("name", $("#productName").val());
      formData.append("price", $("#productPrice").val());
      formData.append("image", image);
      formData.append("products", itemChain);

      requestXhr("PATCH", "/offer/" + idOffer, formData, res => {
        cleanAndAppend("#comboProducts", '<option class="right" disabled selected>...</option>');
        loadProductList();
        resetFields();
        if (croppieObj){
          croppieObj.destroy();
          cleanAndAppend("#imageRow", `<img class="circle responsive-img col s10 offset-s1 m6 offset-m3 l8 offset-l2" id="productImage" src="/images/default-product-image.jpg" style="object-fit: cover; padding: 0;">
            <input id="fileElem" type="file" accept="image/*" style="display:none" onchange="handleFiles(this.files,'productImage')">`);
          initFileInput("productImage", "fileElem");
        }
        M.toast({ html: "Offer updated", classes: "green" });
      });

      return false;
    });
  } else {
    M.toast({ html: "No products in offer", classes: "orange" });
  }
}

function resetFields() {
  $("#productName").val("");
  $("#productPrice").val("");
  $("#productImage").attr("src", "/images/default-product-image.jpg");
  cart = [];
  reloadCart();
}
