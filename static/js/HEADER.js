export async function loadHeader() {
    try {
        const response = await fetch("../html/HEADER.html");
        const data = await response.text();
        document.querySelector("header").innerHTML = data;

        loadStoredValues();
        toggleAlertMessageBoxStateListener();
        toggleMainHeaderListener();
        ribbonActionsBtnListener();
        launcherPanelListener();
    } catch (error) {
        console.error(error);
    }
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

function toggleAlertMessageBoxStateListener() {
    toggleAlertMessageBoxState();
    document.getElementById("expandErrorMessageIcon").addEventListener("click", () => {
        alertMessageBoxToggleState = (alertMessageBoxToggleState + 1) % 3;
        localStorage.setItem("alertMessageBoxToggleState", alertMessageBoxToggleState);
        toggleAlertMessageBoxState();
    });
}
function toggleAlertMessageBoxState() {
    console.log(alertMessageBoxToggleState);
    const alertMessage = document.getElementById("alertMessage");
    const alertMessageBox = document.querySelector(".alert-message-box");
    
    const alert = document.querySelector(".alert");
    switch (alertMessageBoxToggleState) {
        case 0:
            // truncated
            alertMessage.style.display = "-webkit-box";
            alertMessage.style.webkitBoxOrient = "vertical";
            alertMessage.style.overflow = "hidden";
            alertMessage.style.textOverflow = "ellipsis";
            alertMessage.style.whiteSpace = "normal";
            alertMessage.style.webkitLineClamp = "1";
            alertMessage.style.visibility = "visible";

            expandErrorMessageIcon.style.transform = "rotate(0deg)";
            alertMessageBox.style.display = "block";
            alert.style.width = "50%";
            break;
        case 1:
            // expanded
            alertMessage.style.display = "block";
            alertMessage.style.webkitBoxOrient = "unset";
            alertMessage.style.overflow = "visible";
            alertMessage.style.textOverflow = "unset";
            alertMessage.style.whiteSpace = "normal";
            alertMessage.style.webkitLineClamp = "unset";
            alertMessage.style.visibility = "visible";

            expandErrorMessageIcon.style.transform = "rotate(180deg)";
            alert.style.width = "50%";
            break;
        case 2:
            // hidden
            alertMessageBox.style.display = "none";

            expandErrorMessageIcon.style.transform = "rotate(90deg)";
            alert.style.width = "auto";
            break;
        case 3:
            // none
            alert.style.display = "none";
            break;
    }
}

function toggleMainHeaderListener() {
    toggleMainHeaderState();
    document.getElementById("toggleHeaderIcon").addEventListener("click", () => {
        mainHeaderToggleState = (mainHeaderToggleState + 1) % 2;
        localStorage.setItem("mainHeaderToggleState", mainHeaderToggleState);
        toggleMainHeaderState();
    });
}

function toggleMainHeaderState() {
    const mainHeader = document.querySelector(".main-header");
    const toggleHeaderIcon = document.getElementById("toggleHeaderIcon");
    const headerContainer = document.querySelector(".header-container");
    const ribbon = document.querySelector(".ribbon");

    if (mainHeaderToggleState === 0) {
        // visible
        mainHeader.style.display = "flex";
        toggleHeaderIcon.style.transform = "rotate(0deg)";

        // restore values
        headerContainer.style.padding = "0.5rem 0.5rem 0 0.5rem";
        ribbon.style.marginTop = "0.25rem";
    } else if (mainHeaderToggleState === 1) {
        // hidden
        mainHeader.style.display = "none";
        toggleHeaderIcon.style.transform = "rotate(180deg)";

        // remove header-container padding and ribbon margin
        headerContainer.style.padding = "0 0.5rem 0 0.5rem";
        ribbon.style.marginTop = "0";
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
        // add class "active" to the launcherPanel.
        launcherPanel.classList.toggle("active");
    });
}