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
const textSizeSlider = document.getElementById('range-text-size');
const textSizeValue = document.getElementById('text-size-value');

textSizeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    textSizeValue.textContent = val + '%';
    sendAction('set-text-size', val);
});

// 5. Gestion du Curseur XXL
const btnToggleCursor = document.getElementById('btn-toggle-cursor');
const cursorContainer = document.getElementById('cursor-options-container');
const selectCursorSize = document.getElementById('select-cursor-size');

let cursorActive = false;

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

const btnReadPage = document.getElementById('btn-read-page');
const btnStopAudio = document.getElementById('btn-stop-audio');

btnReadPage.addEventListener('click', () => {
    sendAction('read-page');
    btnReadPage.style.display = 'none';
    btnStopAudio.style.display = 'flex';
});

btnStopAudio.addEventListener('click', () => {
    sendAction('stop-audio');
    btnStopAudio.style.display = 'none';
    btnReadPage.style.display = 'flex';
});