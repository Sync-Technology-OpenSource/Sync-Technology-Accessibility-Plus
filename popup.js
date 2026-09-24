document.getElementById('btn-contrast').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Injecte le CSS de contraste s'il n'y est pas déjà, puis bascule la classe
    chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["accessibility.css"]
    }, () => {
        // Ignore l'erreur si le CSS est déjà injecté
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                document.body.classList.toggle('accessibility-high-contrast');
            }
        });
    });
});

document.getElementById('btn-increase').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            // Augmente la taille de police globale de 10% à chaque clic
            const currentSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
            document.documentElement.style.fontSize = (currentSize * 1.1) + 'px';
        }
    });
});