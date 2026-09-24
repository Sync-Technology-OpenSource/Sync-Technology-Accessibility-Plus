async function sendAction(actionName, value = null) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: actionName, value: value }).catch(() => {
            // Si le content script n'est pas encore injecté, on l'injecte à la volée
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            }, () => {
                chrome.tabs.sendMessage(tab.id, { action: actionName, value: value });
            });
        });
    }
}

// Références globales des éléments de la popup
const textSizeSlider = document.getElementById('range-text-size');
const textSizeValue = document.getElementById('text-size-value');
const btnToggleCursor = document.getElementById('btn-toggle-cursor');
const cursorContainer = document.getElementById('cursor-options-container');
const selectCursorSize = document.getElementById('select-cursor-size');
const btnReadPage = document.getElementById('btn-read-page');
const selectSpeechRate = document.getElementById('select-speech-rate');

let cursorActive = false;
let readingActive = false;

// Au chargement de la popup
document.addEventListener('DOMContentLoaded', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 1. Charger tous les paramètres enregistrés pour initialiser l'UI de la popup
    chrome.storage.sync.get(['textSize', 'cursorSize', 'contrast', 'underline', 'dyslexic'], (data) => {
        if (data.textSize && textSizeSlider && textSizeValue) {
            textSizeSlider.value = data.textSize;
            textSizeValue.textContent = data.textSize + '%';
        }
        if (data.cursorSize && data.cursorSize !== 'normal') {
            if (btnToggleCursor && cursorContainer && selectCursorSize) {
                cursorActive = true;
                btnToggleCursor.style.background = '#2563eb';
                cursorContainer.style.display = 'block';
                selectCursorSize.value = data.cursorSize;
            }
        }
    });

    if (!tab?.id) return;

    // 2. Vérifier auprès du content script si une lecture audio est en cours
    chrome.tabs.sendMessage(tab.id, { action: "get-status" }, (response) => {
        if (response && response.isReading) {
            if (btnReadPage) {
                btnReadPage.style.background = '#dc2626';
                btnReadPage.querySelector('span').textContent = '⏹️ Arrêter la lecture';
                readingActive = true;
            }
        }
    });
});

// 1. Contraste
document.getElementById('btn-contrast').addEventListener('click', () => {
    sendAction('toggle-contrast');
});

// 2. Souligner les liens
document.getElementById('btn-underline').addEventListener('click', () => {
    sendAction('toggle-underline');
});

// 3. Police Dyslexique
document.getElementById('btn-dyslexic').addEventListener('click', () => {
    sendAction('toggle-dyslexic');
});

// 4. Slider de Texte
textSizeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    textSizeValue.textContent = val + '%';
    sendAction('set-text-size', val);
});

// 5. Gestion du Curseur XXL
btnToggleCursor.addEventListener('click', () => {
    cursorActive = !cursorActive;
    if (cursorActive) {
        btnToggleCursor.style.background = '#2563eb';
        btnToggleCursor.style.borderColor = 'var(--st-blue-primary)';
        cursorContainer.style.display = 'block';
        sendAction('set-cursor', selectCursorSize.value);
    } else {
        btnToggleCursor.style.background = '';
        btnToggleCursor.style.borderColor = '';
        cursorContainer.style.display = 'none';
        sendAction('set-cursor', 'normal');
    }
});

selectCursorSize.addEventListener('change', (e) => {
    if (cursorActive) {
        sendAction('set-cursor', e.target.value);
    }
});

// 6. Réinitialiser tout
document.getElementById('btn-reset').addEventListener('click', () => {
    textSizeSlider.value = 100;
    textSizeValue.textContent = '100%';
    cursorActive = false;
    btnToggleCursor.style.background = '';
    btnToggleCursor.style.borderColor = '';
    cursorContainer.style.display = 'none';
    selectCursorSize.value = 'xxl';

    sendAction('reset-all');
});

// Contrôle de la lecture audio avec vitesse
btnReadPage.addEventListener('click', () => {
    readingActive = !readingActive;
    const rate = selectSpeechRate.value;
    
    if (readingActive) {
        btnReadPage.style.background = '#dc2626'; // Rouge pour arrêter
        btnReadPage.querySelector('span').textContent = '⏹️ Arrêter la lecture';
        sendAction('read-page', rate);
    } else {
        btnReadPage.style.background = '';
        btnReadPage.querySelector('span').textContent = '🔊 Lire la page';
        sendAction('stop-audio');
    }
});