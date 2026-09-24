// Gestion du mode Haut Contraste
document.getElementById('btn-contrast').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["accessibility.css"]
    }, () => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                document.body.classList.toggle('accessibility-high-contrast');
            }
        });
    });
});

// Gestion pour Agrandir le texte (+10%)
document.getElementById('btn-increase').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const currentSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
            document.documentElement.style.fontSize = (currentSize * 1.1) + 'px';
        }
    });
});

// Gestion pour Réduire le texte (-10%)
document.getElementById('btn-decrease').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const currentSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
            document.documentElement.style.fontSize = (currentSize / 1.1) + 'px';
        }
    });
});