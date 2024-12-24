export async function loadHeader() {
    try {
        const response = await fetch("../html/HEADER.html");
        const data = await response.text();
        document.querySelector("header").innerHTML = data;

        setScreenSizeH1();
        loadStoredValues();
        toggleAlertMessageBoxStateListener();
        toggleMainHeaderListener();
        ribbonActionsBtnListener();
        launcherPanelListener();
    } catch (error) {
        console.error(error);
    }
}

function setScreenSizeH1() {
    const screenWidth = document.getElementById("screenWidth");
    const screenHeight = document.getElementById("screenHeight");
    const screenOrientation = document.getElementById("screenOrientation");
    screenWidth.innerHTML = window.innerWidth;
    screenHeight.innerHTML = window.innerHeight;
    screenOrientation.innerHTML = window.screen.orientation.type;
    alert(screenWidth.innerHTML);
    window.addEventListener("resize", () => {
        screenWidth.innerHTML = window.innerWidth;
        screenHeight.innerHTML = window.innerHeight;
        screenOrientation.innerHTML = window.screen.orientation.type;
    });
}

// 0: truncated, 1: expanded, 2: hidden, 3: none
let alertMessageBoxToggleState = 0;
// 0: visible, 1: hidden
let mainHeaderToggleState = 0;

function loadStoredValues() {
    const alertToggleState = localStorage.getItem("alertMessageBoxToggleState");
    const headerToggleState = localStorage.getItem("mainHeaderToggleState");
    const activeRibbonBtn = localStorage.getItem("activeRibbonBtn");

    if (alertToggleState) { alertMessageBoxToggleState = parseInt(alertToggleState, 10); }
    if (headerToggleState) { mainHeaderToggleState = parseInt(headerToggleState, 10); }
    if (activeRibbonBtn) {
        // remove when the current url is not the same as the activeRibbonBtn
        const currentUrl = window.location.href
            .split("/")
            .slice(-1)[0]
            .split(".")[0];
        if (activeRibbonBtn !== currentUrl) {
            localStorage.removeItem("activeRibbonBtn");
            return;
        }
        const btn = document.getElementById(activeRibbonBtn);
        if (btn) { addActiveClassToRibbonBtn(btn); }
    }
}

function addClassTo(elements, className) {
    elements.forEach((element) => {
        element.classList.add(className);
    });
}

function removeClassFrom(elements, className) {
    elements.forEach((element) => {
        element.classList.remove(className);
    });
}

function toggleAlertMessageBoxStateListener() {
    const expandErrorMessageIcon = document.getElementById("expandErrorMessageIcon");
    expandErrorMessageIcon.addEventListener("click", () => {
        alertMessageBoxToggleState = (alertMessageBoxToggleState + 1) % 3; // cycle through 0, 1, 2
        localStorage.setItem("alertMessageBoxToggleState", alertMessageBoxToggleState);
        toggleAlertMessageBoxState();
    });
    alertMessageBoxToggleState = parseInt(localStorage.getItem("alertMessageBoxToggleState")) || 0;
    toggleAlertMessageBoxState();
}

function toggleAlertMessageBoxState() {
    const alertMessage = document.getElementById("alertMessage");
    const alertMessageBox = document.querySelector(".alert-message-box");
    const expandErrorMessageIcon = document.getElementById("expandErrorMessageIcon");
    const alert = document.querySelector(".alert");

    removeClassFrom([alertMessage, alertMessageBox, expandErrorMessageIcon, alert], "truncated");
    removeClassFrom([alertMessage, alertMessageBox, expandErrorMessageIcon, alert], "expanded");
    removeClassFrom([alertMessageBox, expandErrorMessageIcon, alert], "hidden");
    removeClassFrom([alert], "none");

    switch (alertMessageBoxToggleState) {
        case 0:
            // truncated
            addClassTo([alertMessage, alertMessageBox, expandErrorMessageIcon, alert], "truncated");
            break;
        case 1:
            // expanded
            addClassTo([alertMessage, alertMessageBox, expandErrorMessageIcon, alert], "expanded");
            break;
        case 2:
            // hidden
            addClassTo([alertMessageBox, expandErrorMessageIcon, alert], "hidden");
            break;
        case 3:
            // none
            addClassTo([alert], "none");
            break;
    }
}


function toggleMainHeaderListener() {
    const toggleHeaderIcon = document.getElementById("toggleHeaderIcon");
    toggleHeaderIcon.addEventListener("click", () => {
        mainHeaderToggleState = (mainHeaderToggleState + 1) % 2;
        localStorage.setItem("mainHeaderToggleState", mainHeaderToggleState);
        toggleMainHeaderState();
    });
    toggleMainHeaderState();
}
function toggleMainHeaderState() {
    const mainHeader = document.querySelector(".main-header");
    const toggleHeaderIcon = document.getElementById("toggleHeaderIcon");
    const headerContainer = document.querySelector(".header-container");
    const ribbon = document.querySelector(".ribbon");

    removeClassFrom([mainHeader, toggleHeaderIcon, headerContainer, ribbon], "visible");
    removeClassFrom([mainHeader, toggleHeaderIcon, headerContainer, ribbon], "hidden");

    if (mainHeaderToggleState === 0) {
        // visible
        addClassTo([mainHeader, toggleHeaderIcon, headerContainer, ribbon], "visible");
    } else if (mainHeaderToggleState === 1) {
        // hidden
        addClassTo([mainHeader, toggleHeaderIcon, headerContainer, ribbon], "hidden");
    }
}

function addActiveClassToRibbonBtn(btn) {
    const ribbonActions = document.querySelector(".ribbon-actions ul");
    ribbonActions.querySelectorAll("li").forEach((element) => {
        element.classList.remove("active");
    });
    btn.classList.add("active");
    localStorage.setItem("activeRibbonBtn", btn.id);
}

function ribbonActionsBtnListener() {
    const controlBtn = document.getElementById("pico-rc_control");
    const joystickBtn = document.getElementById("pico-rc_joystick");
    const recordedBtn = document.getElementById("pico-rc_recorded");
    const drawingBtn = document.getElementById("pico-rc_drawing");
    const moreBtn = document.getElementById("pico-rc_more");

    controlBtn.addEventListener("click", () => {
        addActiveClassToRibbonBtn(controlBtn);
        window.location.href = "../html/pico-rc_control.html";
    });
    joystickBtn.addEventListener("click", () => {
        addActiveClassToRibbonBtn(joystickBtn);
        window.location.href = "../html/pico-rc_joystick.html";
    });
    recordedBtn.addEventListener("click", () => {
        addActiveClassToRibbonBtn(recordedBtn);
        window.location.href = "../html/pico-rc_recorded.html";
    });
    drawingBtn.addEventListener("click", () => {
        addActiveClassToRibbonBtn(drawingBtn);
        window.location.href = "../html/pico-rc_drawing.html";
    });
    moreBtn.addEventListener("click", () => {
        // load the rest of "li" elements to the list
        // code here
    });
}

function launcherPanelListener() {
    const launcherIcon = document.getElementById("launcherIcon");
    const launcherPanel = document.querySelector(".launcher-panel");

    launcherIcon.addEventListener("click", () => {
        launcherPanel.classList.toggle("active");
    });
}