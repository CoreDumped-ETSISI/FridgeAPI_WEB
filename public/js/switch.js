const keyName = "viewMode";
const lightCss = "/css/main_style.css";
const darkCss = "/css/main_style_dark.css";
const typeSheet = "stylesheet";

console.log("My body is ready!");
prepareSwitchPosition();

// Initialize the switch in the proper position and the equivalent value
async function prepareSwitchPosition() {
  var s = document.getElementById("switchCheckbox");
  
  if (!localStorage.getItem(keyName)){
    localStorage.setItem(keyName, true);
  }

  if (localStorage.getItem(keyName) === "true") {
    if (s) {
      await initialSwitchPosition(s);
    } else {
      changeStyleSheet(darkCss);
    }
  } else {
    changeStyleSheet(lightCss);
  }
}

function initialSwitchPosition(s) {
  return new Promise((resolve, reject) => {
    localStorage.setItem(keyName, false);
    s.click();
    resolve();
  });
}

// Configure the proper result of the switch.
// 'false' value for light theme and 'true' value for dark theme.
function changeSwitch() {
  if (localStorage.getItem(keyName) === "true") {
    switchClicked(lightCss, false);
  } else {
    switchClicked(darkCss, true);
  }
}

// Set the results raised by clicking the switch
function switchClicked(newCss, boolVal){
  changeStyleSheet(newCss);
  localStorage.setItem(keyName, boolVal);
}

// Appends a new stylesheet element in HTML header
function changeStyleSheet(newCss) {
  var link = document.createElement("link");
  link.type = "text/css";
  link.rel = typeSheet;
  link.media = "screen,projection";
  link.href = newCss;

  document.head.appendChild(link);
}
