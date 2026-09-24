chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.id) return;
        
        if (command === "toggle-contrast") {
            chrome.tabs.sendMessage(tabs[0].id, { action: "toggle-contrast" });
        } else if (command === "read-page") {
            chrome.tabs.sendMessage(tabs[0].id, { action: "read-page", rate: 1.0 });
        }
    });
});

// Optionnel : s'assure que le contenu s'exécute ou synchronise le stockage global si nécessaire
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Sync Technology - Accessibility Plus installée et prête pour tous les sites.");
});