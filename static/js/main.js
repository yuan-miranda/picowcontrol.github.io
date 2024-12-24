import { loadHeader } from "./HEADER.js";

document.addEventListener("DOMContentLoaded", async () => {
    await loadHeader();
    
    // prompt the user screen size
    const screenSize = window.innerWidth;
    alert(screenSize);
});