let currentUtterance = null;
let isReading = false;
let currentTextSize = '100'; // Variable pour stocker la taille du texte courante

// 1. Appliquer les préférences stockées dès le chargement de la page
chrome.storage.sync.get(['contrast', 'underline', 'dyslexic', 'textSize', 'cursorSize'], (data) => {
    if (data.contrast) document.body.classList.add('accessibility-high-contrast');
    if (data.underline) document.body.classList.add('accessibility-underline-links');
    if (data.dyslexic) document.body.classList.add('accessibility-dyslexic');
    if (data.textSize) {
        currentTextSize = data.textSize;
        document.documentElement.style.fontSize = data.textSize + '%';
    }
    if (data.cursorSize && data.cursorSize !== 'normal') {
        document.body.classList.add('accessibility-cursor-' + data.cursorSize);
    }
});

// Création de la barre de progression audio (initialement cachée)
const progressBar = document.createElement('div');
progressBar.id = 'accessibility-audio-progress';
progressBar.style.cssText = 'position:fixed;top:0;left:0;height:4px;background:#2563eb;width:0%;z-index:999999;transition:width 0.2s linear;display:none;';
document.documentElement.appendChild(progressBar);

// Écouteur de messages venant de la popup ou du background (raccourcis)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Répondre à la demande de statut de la popup
    if (request.action === "get-status") {
        sendResponse({ isReading: isReading });
        return true;
    }

    handleAction(request, sendResponse);
    return true; // Garde le canal ouvert pour les réponses asynchrones si besoin
});

function handleAction(request, sendResponse) {
    if (request.action === "toggle-contrast") {
        document.body.classList.toggle('accessibility-high-contrast');
        saveState();
    }
    if (request.action === "toggle-underline") {
        document.body.classList.toggle('accessibility-underline-links');
        saveState();
    }
    if (request.action === "toggle-dyslexic") {
        document.body.classList.toggle('accessibility-dyslexic');
        saveState();
    }
    if (request.action === "set-text-size") {
        currentTextSize = request.value; // Mise à jour de la variable
        document.documentElement.style.fontSize = request.value + '%';
        saveState();
    }
    if (request.action === "set-cursor") {
        const body = document.body;
        body.classList.remove('accessibility-cursor-lg', 'accessibility-cursor-xl', 'accessibility-cursor-xxl');
        if (request.value !== 'normal') {
            body.classList.add('accessibility-cursor-' + request.value);
        }
        saveState();
    }
    if (request.action === "reset-all") {
        document.body.classList.remove(
            'accessibility-high-contrast', 
            'accessibility-underline-links', 
            'accessibility-cursor-lg',
            'accessibility-cursor-xl',
            'accessibility-cursor-xxl',
            'accessibility-dyslexic'
        );
        document.documentElement.style.fontSize = '';
        currentTextSize = '100';
        stopSpeech();
        chrome.storage.sync.clear();
    }
    
    // Audio avec vitesse personnalisée et barre de progression
    if (request.action === "read-page") {
        if (isReading) {
            stopSpeech();
            if (sendResponse) sendResponse({ status: "stopped" });
            return;
        }

        window.speechSynthesis.cancel();
        const textElements = document.querySelectorAll('h1, h2, h3, p, li');
        let textToRead = "";
        
        textElements.forEach(el => {
            if (el.offsetParent !== null) {
                textToRead += el.innerText + ". ";
            }
        });

        if (textToRead.trim() === "") {
            textToRead = document.body.innerText;
        }

        currentUtterance = new SpeechSynthesisUtterance(textToRead);
        currentUtterance.lang = 'fr-FR';
        currentUtterance.rate = request.rate ? parseFloat(request.rate) : 1.0;

        progressBar.style.display = 'block';

        currentUtterance.onboundary = (event) => {
            let progress = (event.charIndex / textToRead.length) * 100;
            progressBar.style.width = Math.min(progress, 100) + '%';
        };

        currentUtterance.onend = () => {
            stopSpeech();
        };

        currentUtterance.onerror = () => {
            stopSpeech();
        };

        window.speechSynthesis.speak(currentUtterance);
        isReading = true;
        if (sendResponse) sendResponse({ status: "reading" });
    }

    if (request.action === "stop-audio") {
        stopSpeech();
        if (sendResponse) sendResponse({ status: "stopped" });
    }

    if (sendResponse) sendResponse({ status: "success" });
}

function stopSpeech() {
    window.speechSynthesis.cancel();
    isReading = false;
    progressBar.style.display = 'none';
    progressBar.style.width = '0%';
}

function saveState() {
    const state = {
        contrast: document.body.classList.contains('accessibility-high-contrast'),
        underline: document.body.classList.contains('accessibility-underline-links'),
        dyslexic: document.body.classList.contains('accessibility-dyslexic'),
        textSize: currentTextSize, // Utilisation de la variable globale sécurisée
        cursorSize: document.body.className.match(/accessibility-cursor-(lg|xl|xxl)/)?.[1] || 'normal'
    };
    chrome.storage.sync.set(state);
}