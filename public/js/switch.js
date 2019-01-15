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
      changeStyleSheet(darkCss);
    }
  }
}

function changeSwitch() {
  if (localStorage.getItem(keyName) === "true") {
    changeStyleSheet(lightCss);
    localStorage.setItem(keyName, false);
  } else {
    changeStyleSheet(darkCss);
    localStorage.setItem(keyName, true);
  }
}

function changeStyleSheet(newCss) {
  var link = document.createElement("link");
  link.type = "text/css";
  link.rel = typeSheet;
  link.media = "screen,projection";
  link.href = newCss;

  document.head.appendChild(link);
}
