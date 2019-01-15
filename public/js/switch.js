const keyName = "viewMode";
const lightCss = "/css/main_style.css";
const darkCss = "/css/main_style_dark.css";
const typeSheet = "stylesheet";

stageSwitch();

function stageSwitch() {
  var s = document.getElementById("switchCheckbox");
  if (localStorage.getItem(keyName) === "true") {
    if (s) {
      localStorage.setItem(keyName, false);
      s.click();
    } else {
      changeStyleSheet(darkCss, lightCss);
    }
  }
}

function changeSwitch() {
  if (localStorage.getItem(keyName) === "true") {
    switchClicked(lightCss, darkCss, false);
  } else {
    switchClicked(darkCss, lightCss, true);
  }
}

function switchClicked(newCss, oldCss, boolVal){
  changeStyleSheet(newCss, oldCss);
  localStorage.setItem(keyName, boolVal);
}

function changeStyleSheet(newCss, oldCss) {
  var link = document.createElement("link");
  link.type = "text/css";
  link.rel = typeSheet;
  link.media = "screen,projection";
  link.href = newCss;

  new Promise((resolve, reject) => {
    document.head.appendChild(link);
    resolve();
  }).then(content => {
    console.log("eliminando css anterior")
    $(`link[rel=${typeSheet}][href=${oldCss}]`).remove();
  })
}
