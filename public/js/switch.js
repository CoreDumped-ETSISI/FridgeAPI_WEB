const keyName = "viewMode";
const lightCss = "/css/main_style.css";
const darkCss = "/css/main_style_dark.css";
const typeSheet = "stylesheet";

$(window).ready(function() {
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
);

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

  document.head.appendChild(link);
}
