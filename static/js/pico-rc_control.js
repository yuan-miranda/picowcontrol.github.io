import { loadHeader } from "../js/HEADER.js";

document.addEventListener("DOMContentLoaded", async () => {
    await loadHeader();

    let forwardDebounceTimer, backwardDebounceTimer, gearSpeedDebounceTimer, toggleModeDebounceTimer, rightDebounceTimer, leftDebounceTimer;
    let forwardClickCount = 0, backwardClickCount = 0, gearSpeedClickCount = 0, toggleModeClickCount = 0, rightClickCount = 0, leftClickCount = 0;

    async function sendControlStates(controlStates) {
        await fetch(`/api/run/action/control/${controlStates}`);
    }

    function getControlStates() {
        const forward = document.getElementById("forwardBtn").classList.contains("active") ? "1" : "0";
        const backward = document.getElementById("backwardBtn").classList.contains("active") ? "1" : "0";
        const gearSpeed = document.getElementById("gearSpeedBtn").classList.contains("active") ? "1" : "0";
        const toggleMode = document.getElementById("toggleModeBtn").classList.contains("active") ? "1" : "0";
        const right = document.getElementById("rightBtn").classList.contains("active") ? "1" : "0";
        const left = document.getElementById("leftBtn").classList.contains("active") ? "1" : "0";
        return `${forward}${backward}${gearSpeed}${toggleMode}${right}${left}`;
    }

    function toggleButtonState(button) {
        button.classList.toggle("active");
        const controlStates = getControlStates();
        sendControlStates(controlStates);
    }

    async function holdToggleBtn(e, button) {
        if (e) e.preventDefault();
        let debounceTimer, clickCount;

        switch (button) {
            case "forward":
                debounceTimer = forwardDebounceTimer;
                clickCount = forwardClickCount;
                break;
            case "backward":
                debounceTimer = backwardDebounceTimer;
                clickCount = backwardClickCount;
                break;
            case "gear_speed":
                debounceTimer = gearSpeedDebounceTimer;
                clickCount = gearSpeedClickCount;
                break;
            case "toggle_mode":
                debounceTimer = toggleModeDebounceTimer;
                clickCount = toggleModeClickCount;
                break;
            case "right":
                debounceTimer = rightDebounceTimer;
                clickCount = rightClickCount;
                break;
            case "left":
                debounceTimer = leftDebounceTimer;
                clickCount = leftClickCount;
                break;
        }

        if (debounceTimer) {
            clickCount++;
            if (clickCount == 1) toggleButtonState(button);
            return;
        }

        debounceTimer = setTimeout(() => debounceTimer = null, 50); // original: 100ms
        toggleButtonState(button);
    }

    setInterval(async () => {
        if (forwardClickCount > 0) forwardClickCount--;
        if (backwardClickCount > 0) backwardClickCount--;
        if (gearSpeedClickCount > 0) gearSpeedClickCount--;
        if (toggleModeClickCount > 0) toggleModeClickCount--;
        if (rightClickCount > 0) rightClickCount--;
        if (leftClickCount > 0) leftClickCount--;
    }, 30); // original: 30ms

    const forwardBtn = document.getElementById("forwardBtn");
    const backwardBtn = document.getElementById("backwardBtn");
    const gearSpeedBtn = document.getElementById("gearSpeedBtn");
    const toggleModeBtn = document.getElementById("toggleModeBtn");
    const rightBtn = document.getElementById("rightBtn");
    const leftBtn = document.getElementById("leftBtn");

    // forwardBtn.addEventListener("pointerdown", (e) => holdToggleBtn(e, forwardBtn));
    // forwardBtn.addEventListener("pointerup", (e) => holdToggleBtn(e, forwardBtn));

    // backwardBtn.addEventListener("pointerdown", (e) => holdToggleBtn(e, backwardBtn));
    // backwardBtn.addEventListener("pointerup", (e) => holdToggleBtn(e, backwardBtn));

    // gearSpeedBtn.addEventListener("pointerdown", (e) => holdToggleBtn(e, gearSpeedBtn));
    // gearSpeedBtn.addEventListener("pointerup", (e) => holdToggleBtn(e, gearSpeedBtn));

    // toggleModeBtn.addEventListener("pointerdown", (e) => holdToggleBtn(e, toggleModeBtn));
    // toggleModeBtn.addEventListener("pointerup", (e) => holdToggleBtn(e, toggleModeBtn));

    // rightBtn.addEventListener("pointerdown", (e) => holdToggleBtn(e, rightBtn));
    // rightBtn.addEventListener("pointerup", (e) => holdToggleBtn(e, rightBtn));

    // leftBtn.addEventListener("pointerdown", (e) => holdToggleBtn(e, leftBtn));
    // leftBtn.addEventListener("pointerup", (e) => holdToggleBtn(e, leftBtn));

    // use touchstart and touchend events for mobile devices
    forwardBtn.addEventListener("touchstart", (e) => holdToggleBtn(e, forwardBtn));
    forwardBtn.addEventListener("touchend", (e) => holdToggleBtn(e, forwardBtn));

    backwardBtn.addEventListener("touchstart", (e) => holdToggleBtn(e, backwardBtn));
    backwardBtn.addEventListener("touchend", (e) => holdToggleBtn(e, backwardBtn));

    gearSpeedBtn.addEventListener("touchstart", (e) => holdToggleBtn(e, gearSpeedBtn));
    gearSpeedBtn.addEventListener("touchend", (e) => holdToggleBtn(e, gearSpeedBtn));

    toggleModeBtn.addEventListener("touchstart", (e) => holdToggleBtn(e, toggleModeBtn));
    toggleModeBtn.addEventListener("touchend", (e) => holdToggleBtn(e, toggleModeBtn));

    rightBtn.addEventListener("touchstart", (e) => holdToggleBtn(e, rightBtn));
    rightBtn.addEventListener("touchend", (e) => holdToggleBtn(e, rightBtn));

    leftBtn.addEventListener("touchstart", (e) => holdToggleBtn(e, leftBtn));
    leftBtn.addEventListener("touchend", (e) => holdToggleBtn(e, leftBtn));
});
