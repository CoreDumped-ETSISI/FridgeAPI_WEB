const keyName = "viewMode";
const lightCss = "/css/main_style.css";
const darkCss = "/css/main_style_dark.css";
const typeSheet = "stylesheet";

prepareSwitchPosition();

function prepareSwitchPosition() {
  var s = document.getElementById("switchCheckbox");
  if (localStorage.getItem(keyName) === "true") {
    if (s) {
      localStorage.setItem(keyName, false);
      s.click();
    } else {
      changeStyleSheet(darkCss);
    }
  } else {
    changeStyleSheet(lightCss);
  }
}

function changeSwitch() {
  if (localStorage.getItem(keyName) === "true") {
    switchClicked(lightCss, false);
  } else {
    switchClicked(darkCss, true);
  }
}

function switchClicked(newCss, boolVal){
  changeStyleSheet(newCss);
  localStorage.setItem(keyName, boolVal);
}

function changeStyleSheet(newCss) {
  var link = document.createElement("link");
  link.type = "text/css";
  link.rel = typeSheet;
  link.media = "screen,projection";
  link.href = newCss;

  document.head.appendChild(link);
}
