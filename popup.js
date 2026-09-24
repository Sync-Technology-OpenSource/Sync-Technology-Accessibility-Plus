async function sendAction(actionName, value = null) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: actionName, value: value }).catch(() => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            }, () => {
                chrome.tabs.sendMessage(tab.id, { action: actionName, value: value });
            });
        });
    }
}

const textSizeSlider = document.getElementById('range-text-size');
const textSizeValue = document.getElementById('text-size-value');
const btnToggleCursor = document.getElementById('btn-toggle-cursor');
const cursorContainer = document.getElementById('cursor-options-container');
const selectCursorSize = document.getElementById('select-cursor-size');
const btnReadPage = document.getElementById('btn-read-page');
const selectSpeechRate = document.getElementById('select-speech-rate');

let cursorActive = false;
let readingActive = false;

// Fonction pour mettre à jour l'affichage visuel des cartes de profils
function updateActiveProfileUI(activeProfileName) {
    const profiles = ['dyslexia', 'visually-impaired', 'keyboard'];
    profiles.forEach(p => {
        const el = document.getElementById('profile-' + p);
        if (el) {
            if (p === activeProfileName) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        }
    });
}

// Gestion propre du clic : réinitialise d'abord tout, puis applique le nouveau si ce n'était pas le même
function handleProfileClick(profileName) {
    chrome.storage.sync.get(['activeProfile'], (data) => {
        const currentActive = data.activeProfile;

        // On nettoie d'abord la page et le stockage pour éviter les superpositions de profils
        sendAction('reset-all');

        if (currentActive === profileName) {
            // Si on cliquait sur celui qui était déjà actif, on désactive tout
            chrome.storage.sync.set({ activeProfile: null }, () => {
                updateActiveProfileUI(null);
            });
        } else {
            // Sinon, on applique le nouveau profil sélectionné
            sendAction('apply-profile', profileName);
            chrome.storage.sync.set({ activeProfile: profileName }, () => {
                updateActiveProfileUI(profileName);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const tabManualBtn = document.getElementById('btn-tab-manual');
    const tabProfilesBtn = document.getElementById('btn-tab-profiles');
    const tabManualContent = document.getElementById('tab-manual');
    const tabProfilesContent = document.getElementById('tab-profiles');

    if (tabManualBtn && tabProfilesBtn) {
        tabManualBtn.addEventListener('click', () => {
            tabManualBtn.classList.add('active');
            tabProfilesBtn.classList.remove('active');
            tabManualContent.classList.add('active');
            tabProfilesContent.classList.remove('active');
        });

        tabProfilesBtn.addEventListener('click', () => {
            tabProfilesBtn.classList.add('active');
            tabManualBtn.classList.remove('active');
            tabProfilesContent.classList.add('active');
            tabManualContent.classList.remove('active');
        });
    }

    const profileDyslexia = document.getElementById('profile-dyslexia');
    const profileVisuallyImpaired = document.getElementById('profile-visually-impaired');
    const profileKeyboard = document.getElementById('profile-keyboard');
    const saveProfileBtn = document.getElementById('btn-save-profile');
    const loadProfileBtn = document.getElementById('btn-load-profile');

    // Charger l'état actif initial depuis le stockage global
    chrome.storage.sync.get(['activeProfile'], (data) => {
        if (data.activeProfile) {
            updateActiveProfileUI(data.activeProfile);
        }
    });

    if (profileDyslexia) {
        profileDyslexia.addEventListener('click', () => handleProfileClick('dyslexia'));
    }
    if (profileVisuallyImpaired) {
        profileVisuallyImpaired.addEventListener('click', () => handleProfileClick('visually-impaired'));
    }
    if (profileKeyboard) {
        profileKeyboard.addEventListener('click', () => handleProfileClick('keyboard'));
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            sendAction('save-custom-profile');
            alert("Profil personnalisé sauvegardé avec succès !");
        });
    }

    if (loadProfileBtn) {
        loadProfileBtn.addEventListener('click', () => {
            sendAction('load-custom-profile');
            chrome.storage.sync.set({ activeProfile: null });
            updateActiveProfileUI(null);
        });
    }

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
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

document.getElementById('btn-contrast').addEventListener('click', () => { 
    sendAction('toggle-contrast'); 
    chrome.storage.sync.set({ activeProfile: null });
    updateActiveProfileUI(null); 
});
document.getElementById('btn-underline').addEventListener('click', () => { 
    sendAction('toggle-underline'); 
    chrome.storage.sync.set({ activeProfile: null });
    updateActiveProfileUI(null); 
});
document.getElementById('btn-dyslexic').addEventListener('click', () => { 
    sendAction('toggle-dyslexic'); 
    chrome.storage.sync.set({ activeProfile: null });
    updateActiveProfileUI(null); 
});

textSizeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    textSizeValue.textContent = val + '%';
    sendAction('set-text-size', val);
    chrome.storage.sync.set({ activeProfile: null });
    updateActiveProfileUI(null);
});

btnToggleCursor.addEventListener('click', () => {
    cursorActive = !cursorActive;
    if (cursorActive) {
        btnToggleCursor.style.background = '#2563eb';
        cursorContainer.style.display = 'block';
        sendAction('set-cursor', selectCursorSize.value);
    } else {
        btnToggleCursor.style.background = '';
        cursorContainer.style.display = 'none';
        sendAction('set-cursor', 'normal');
    }
    chrome.storage.sync.set({ activeProfile: null });
    updateActiveProfileUI(null);
});

selectCursorSize.addEventListener('change', (e) => {
    if (cursorActive) sendAction('set-cursor', e.target.value);
});

document.getElementById('btn-reset').addEventListener('click', () => {
    textSizeSlider.value = 100;
    textSizeValue.textContent = '100%';
    cursorActive = false;
    btnToggleCursor.style.background = '';
    cursorContainer.style.display = 'none';
    selectCursorSize.value = 'xxl';
    chrome.storage.sync.set({ activeProfile: null });
    updateActiveProfileUI(null);
    sendAction('reset-all');
});

btnReadPage.addEventListener('click', () => {
    readingActive = !readingActive;
    const rate = selectSpeechRate.value;
    if (readingActive) {
        btnReadPage.style.background = '#dc2626';
        btnReadPage.querySelector('span').textContent = '⏹️ Arrêter la lecture';
        sendAction('read-page', rate);
    } else {
        btnReadPage.style.background = '';
        btnReadPage.querySelector('span').textContent = '🔊 Lire la page';
        sendAction('stop-audio');
    }
});

const selectLineHeight = document.getElementById('select-line-height');
if (selectLineHeight) {
    selectLineHeight.addEventListener('change', (e) => {
        sendAction('set-line-height', e.target.value);
        chrome.storage.sync.set({ activeProfile: null });
        updateActiveProfileUI(null);
    });
}

const selectLetterSpacing = document.getElementById('select-letter-spacing');
if (selectLetterSpacing) {
    selectLetterSpacing.addEventListener('change', (e) => {
        sendAction('set-letter-spacing', e.target.value);
        chrome.storage.sync.set({ activeProfile: null });
        updateActiveProfileUI(null);
    });
}

const btnToggleFocus = document.getElementById('btn-toggle-focus');
let focusActive = false;
if (btnToggleFocus) {
    btnToggleFocus.addEventListener('click', () => {
        focusActive = !focusActive;
        btnToggleFocus.style.background = focusActive ? '#2563eb' : '';
        sendAction('toggle-focus');
        chrome.storage.sync.set({ activeProfile: null });
        updateActiveProfileUI(null);
    });
}