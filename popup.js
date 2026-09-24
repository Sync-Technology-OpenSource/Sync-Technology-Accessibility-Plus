// Fonction utilitaire pour injecter le CSS et exécuter une action sur l'onglet actif
async function runAccessibilityAction(actionFunction) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["accessibility.css"]
    }, () => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: actionFunction
        });
    });
}

// 1. Contraste
document.getElementById('btn-contrast').addEventListener('click', () => {
    runAccessibilityAction(() => {
        document.body.classList.toggle('accessibility-high-contrast');
    });
});

// 2. Souligner les liens
document.getElementById('btn-underline').addEventListener('click', () => {
    runAccessibilityAction(() => {
        document.body.classList.toggle('accessibility-underline-links');
    });
});

// 3. Curseur XXL
document.getElementById('btn-cursor').addEventListener('click', () => {
    runAccessibilityAction(() => {
        document.body.classList.toggle('accessibility-large-cursor');
    });
});

// 4. Agrandir le texte
document.getElementById('btn-increase').addEventListener('click', () => {
    runAccessibilityAction(() => {
        const currentSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
        document.documentElement.style.fontSize = (currentSize * 1.1) + 'px';
    });
});

// 5. Réduire le texte
document.getElementById('btn-decrease').addEventListener('click', () => {
    runAccessibilityAction(() => {
        const currentSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
        document.documentElement.style.fontSize = (currentSize / 1.1) + 'px';
    });
});

// 6. Police Dyslexique
document.getElementById('btn-dyslexic').addEventListener('click', () => {
    runAccessibilityAction(() => {
        document.body.classList.toggle('accessibility-dyslexic');
    });
});

// 7. Réinitialiser tout
document.getElementById('btn-reset').addEventListener('click', () => {
    runAccessibilityAction(() => {
        document.body.classList.remove(
            'accessibility-high-contrast', 
            'accessibility-underline-links', 
            'accessibility-large-cursor', 
            'accessibility-dyslexic'
        );
        document.documentElement.style.fontSize = '';
    });
});