// CURRENT BUGS:
/**
 * 1. When the user clicks on the dropdown, the first action after the page reloads is not underlined (active class)
 * 2. Theres a bug where when you leave and come back to the page and your on like on action page, the url is still there, but the active class is not there
 * 2.1 and the dropdown is not selected, its "Select Script"
 * 3. Randomly disconnects from the server and never can connect back (fixed by restarting the server by brute force lol)
 * 4. This current implementation would not work on GitHub Pages because it uses a server to fetch the scripts and actions
 * 4.1 Will need to implment a way to fetch the scripts and actions from the client side (premade list of scripts and actions)
 */

export async function loadHeader() {
    try {
        const response = await fetch("../html/HEADER.html");
        const data = await response.text();
        document.querySelector("header").innerHTML = data;

        await loadStoredValues();
        toggleAlertMessageBoxStateListener();
        toggleMainHeaderListener();
        launcherPanelListener();
        loadRibbonActionsListener();
    } catch (error) {
        console.error(error);
    }
}

// 0: truncated, 1: expanded, 2: hidden, 3: none
let alertMessageBoxToggleState = 0;
// 0: visible, 1: hidden
let mainHeaderToggleState = 0;

async function loadStoredValues() {
    const alertToggleState = localStorage.getItem("alertMessageBoxToggleState");
    const headerToggleState = localStorage.getItem("mainHeaderToggleState");
    const selectedScript = localStorage.getItem("selectedScript");
    const activeRibbonBtn = localStorage.getItem("activeRibbonBtn");
    
    if (alertToggleState) { alertMessageBoxToggleState = parseInt(alertToggleState, 10); }
    if (headerToggleState) { mainHeaderToggleState = parseInt(headerToggleState, 10); }

    await loadScriptDropdown();
    if (selectedScript) {
        const scriptDropdown = document.getElementById("scriptDropdown");
        const selectedIndex = Array.from(scriptDropdown.options).findIndex((option) => option.textContent === selectedScript);
        scriptDropdown.selectedIndex = selectedIndex;
        await loadRibbonActionsNoRedirect(selectedScript);
    }

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

async function loadScriptDropdown() {
    const scriptDropdown = document.getElementById("scriptDropdown");
    try {
        // fetch a list of scripts in the "scripts" directory
        const response = await fetch("/api/get/scripts");
        if (!response.ok) {
            alert("Failed to fetch scripts");
            return;
        }
        const data = await response.json();
        const scripts = data.scripts;
        console.log(scripts);
        scripts.forEach((script, index) => {
            const option = document.createElement("option");
            option.value = index + 1;
            option.textContent = script;
            scriptDropdown.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        alert(`CATCH: ${error}`);
    }
}

async function loadRibbonActionsNoRedirect(script) {
    const ribbonActions = document.querySelector(".ribbon-actions ul");
    try {
        // fetch a list of actions in the specified script folder
        const response = await fetch(`/api/get/actions/${script}`);
        if (!response.ok) {
            if (response.status === 403) {
                alert("403 Forbidden: Directory traversal is not allowed");
            }
            else if (response.status === 404) {
                alert(`404 Not Found: ${script} doesn't exist on "scripts" directory`);
            } else {
                console.error(response);
                alert("Failed to fetch actions");
            }
            return;
        }
        const data = await response.json();
        const actions = data.actions;
        actions.forEach((action, index) => {
            // ex: action = "action.py"
            const actionName = action.split(".")[0];
            const li = document.createElement("li");
            li.id = `${script}_${actionName}`;
            li.title = action;
            li.textContent = actionName.charAt(0).toUpperCase() + actionName.slice(1);
            ribbonActions.appendChild(li);

            // event listener for each actions
            li.addEventListener("click", () => {
                addActiveClassToRibbonBtn(li);
                console.log("click event", script, actionName);
                window.location.href = `../html/${script}_${actionName}.html`;
            });
        });
    } catch (error) {
        console.error(error);
        alert(`CATCH: ${error}`);
    }
}

async function redirectToFirstRibbonAction(script) {
    try {
        const response = await fetch(`/api/get/actions/${script}`);
        if (!response.ok) {
            if (response.status === 403) {
                alert("403 Forbidden: Directory traversal is not allowed");
            }
            else if (response.status === 404) {
                alert(`404 Not Found: ${script} doesn't exist on "scripts" directory`);
            } else {
                console.error(response);
                alert("Failed to fetch actions");
            }
            return;
        }
        const data = await response.json();
        const actions = data.actions;
        const firstActionName = actions[0].split(".")[0];
        window.location.href = `../html/${script}_${firstActionName}.html`;
    } catch (error) {
        console.error(error);
        alert(`CATCH: ${error}`);
    }
}

function loadRibbonActionsListener() {
    const scriptDropdown = document.getElementById("scriptDropdown");
    scriptDropdown.addEventListener("change", async () => {
        const selectedIndex = scriptDropdown.selectedIndex;
        const script = scriptDropdown.options[selectedIndex].textContent;
        console.log(script, selectedIndex);
        if (script === "Select Script") {
            localStorage.removeItem("selectedScript");
            window.location.href = "/";
            return;
        }
        try {
            localStorage.setItem("selectedScript", script);
            await redirectToFirstRibbonAction(script);
        } catch (error) {
            console.error(error);
            alert(`CATCH: ${error}`);
        }
    });
}

function launcherPanelListener() {
    const launcherIcon = document.getElementById("launcherIcon");
    const launcherPanel = document.querySelector(".launcher-panel");

    launcherIcon.addEventListener("click", () => {
        launcherPanel.classList.toggle("active");
    });
}