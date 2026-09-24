let currentUtterance = null;
let isReading = false;
let currentTextSize = '100';
let currentLineHeight = 'normal';
let currentLetterSpacing = 'normal';

chrome.storage.sync.get(['contrast', 'underline', 'dyslexic', 'textSize', 'cursorSize', 'lineHeight', 'letterSpacing', 'focusHighlight'], (data) => {
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
    if (data.lineHeight && data.lineHeight !== 'normal') {
        currentLineHeight = data.lineHeight;
        document.documentElement.style.setProperty('--st-line-height', data.lineHeight);
        document.body.classList.add('accessibility-custom-line-height');
    }
    if (data.letterSpacing && data.letterSpacing !== 'normal') {
        currentLetterSpacing = data.letterSpacing;
        document.documentElement.style.setProperty('--st-letter-spacing', data.letterSpacing);
        document.body.classList.add('accessibility-custom-letter-spacing');
    }
    if (data.focusHighlight) {
        document.body.classList.add('accessibility-focus-highlight');
    }
});

const customStyle = document.createElement('style');
customStyle.textContent = `
    body.accessibility-custom-line-height p, 
    body.accessibility-custom-line-height li, 
    body.accessibility-custom-line-height h1, 
    body.accessibility-custom-line-height h2, 
    body.accessibility-custom-line-height h3 {
        line-height: var(--st-line-height, 1.5) !important;
    }
    body.accessibility-custom-letter-spacing p, 
    body.accessibility-custom-letter-spacing span, 
    body.accessibility-custom-letter-spacing a, 
    body.accessibility-custom-letter-spacing li {
        letter-spacing: var(--st-letter-spacing, 1px) !important;
    }
    
    body.accessibility-focus-highlight a:focus,
    body.accessibility-focus-highlight button:focus,
    body.accessibility-focus-highlight input:focus,
    body.accessibility-focus-highlight select:focus,
    body.accessibility-focus-highlight textarea:focus,
    body.accessibility-focus-highlight [tabindex]:focus {
        outline: 4px solid #2563eb !important;
        outline-offset: 4px !important;
        box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.3) !important;
    }
`;
document.head.appendChild(customStyle);

const progressBar = document.createElement('div');
progressBar.id = 'accessibility-audio-progress';
progressBar.style.cssText = 'position:fixed;top:0;left:0;height:4px;background:#2563eb;width:0%;z-index:999999;transition:width 0.2s linear;display:none;';
document.documentElement.appendChild(progressBar);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get-status") {
        sendResponse({ isReading: isReading });
        return true;
    }
    handleAction(request, sendResponse);
    return true;
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
        currentTextSize = request.value;
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
    if (request.action === "set-line-height") {
        currentLineHeight = request.value;
        if (request.value === 'normal') {
            document.body.classList.remove('accessibility-custom-line-height');
        } else {
            document.documentElement.style.setProperty('--st-line-height', request.value);
            document.body.classList.add('accessibility-custom-line-height');
        }
        saveState();
    }
    if (request.action === "set-letter-spacing") {
        currentLetterSpacing = request.value;
        if (request.value === 'normal') {
            document.body.classList.remove('accessibility-custom-letter-spacing');
        } else {
            document.documentElement.style.setProperty('--st-letter-spacing', request.value);
            document.body.classList.add('accessibility-custom-letter-spacing');
        }
        saveState();
    }
    if (request.action === "toggle-focus") {
        document.body.classList.toggle('accessibility-focus-highlight');
        saveState();
    }

    // Gestion du basculement (Toggle) des profils types
    if (request.action === "apply-profile") {
        const profile = request.value;
        if (profile === 'dyslexia') {
            const isActive = document.body.classList.toggle('accessibility-dyslexic');
            currentLineHeight = isActive ? '1.5' : 'normal';
            currentLetterSpacing = isActive ? '1px' : 'normal';
            if (isActive) {
                document.documentElement.style.setProperty('--st-line-height', '1.5');
                document.body.classList.add('accessibility-custom-line-height');
                document.documentElement.style.setProperty('--st-letter-spacing', '1px');
                document.body.classList.add('accessibility-custom-letter-spacing');
            } else {
                document.body.classList.remove('accessibility-custom-line-height', 'accessibility-custom-letter-spacing');
            }
        } else if (profile === 'visually-impaired') {
            const isActive = document.body.classList.toggle('accessibility-high-contrast');
            document.body.classList.toggle('accessibility-cursor-xxl', isActive);
            currentTextSize = isActive ? '140' : '100';
            document.documentElement.style.fontSize = currentTextSize + '%';
        } else if (profile === 'keyboard') {
            document.body.classList.toggle('accessibility-focus-highlight');
            document.body.classList.toggle('accessibility-underline-links');
        }
        saveState();
    }

    // Sauvegarde du profil personnalisé
    if (request.action === "save-custom-profile") {
        const customState = {
            contrast: document.body.classList.contains('accessibility-high-contrast'),
            underline: document.body.classList.contains('accessibility-underline-links'),
            dyslexic: document.body.classList.contains('accessibility-dyslexic'),
            textSize: currentTextSize,
            cursorSize: document.body.className.match(/accessibility-cursor-(lg|xl|xxl)/)?.[1] || 'normal',
            lineHeight: currentLineHeight,
            letterSpacing: currentLetterSpacing,
            focusHighlight: document.body.classList.contains('accessibility-focus-highlight')
        };
        chrome.storage.sync.set({ customProfile: customState });
    }

    // Chargement du profil personnalisé sauvegardé
    if (request.action === "load-custom-profile") {
        chrome.storage.sync.get(['customProfile'], (data) => {
            if (!data.customProfile) {
                alert("Aucun profil personnalisé sauvegardé pour le moment.");
                return;
            }
            const p = data.customProfile;
            
            document.body.classList.toggle('accessibility-high-contrast', p.contrast);
            document.body.classList.toggle('accessibility-underline-links', p.underline);
            document.body.classList.toggle('accessibility-dyslexic', p.dyslexic);
            document.body.classList.toggle('accessibility-focus-highlight', p.focusHighlight);

            currentTextSize = p.textSize || '100';
            document.documentElement.style.fontSize = currentTextSize + '%';

            const body = document.body;
            body.classList.remove('accessibility-cursor-lg', 'accessibility-cursor-xl', 'accessibility-cursor-xxl');
            if (p.cursorSize && p.cursorSize !== 'normal') {
                body.classList.add('accessibility-cursor-' + p.cursorSize);
            }

            currentLineHeight = p.lineHeight || 'normal';
            if (currentLineHeight === 'normal') {
                document.body.classList.remove('accessibility-custom-line-height');
            } else {
                document.documentElement.style.setProperty('--st-line-height', currentLineHeight);
                document.body.classList.add('accessibility-custom-line-height');
            }

            currentLetterSpacing = p.letterSpacing || 'normal';
            if (currentLetterSpacing === 'normal') {
                document.body.classList.remove('accessibility-custom-letter-spacing');
            } else {
                document.documentElement.style.setProperty('--st-letter-spacing', currentLetterSpacing);
                document.body.classList.add('accessibility-custom-letter-spacing');
            }

            saveState();
        });
    }

    if (request.action === "reset-all") {
        document.body.classList.remove(
            'accessibility-high-contrast', 
            'accessibility-underline-links', 
            'accessibility-cursor-lg',
            'accessibility-cursor-xl',
            'accessibility-cursor-xxl',
            'accessibility-dyslexic',
            'accessibility-custom-line-height',
            'accessibility-custom-letter-spacing',
            'accessibility-focus-highlight'
        );
        document.documentElement.style.fontSize = '';
        currentTextSize = '100';
        currentLineHeight = 'normal';
        currentLetterSpacing = 'normal';
        stopSpeech();
        chrome.storage.sync.clear();
    }
    
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

        currentUtterance.onend = () => { stopSpeech(); };
        currentUtterance.onerror = () => { stopSpeech(); };

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
        textSize: currentTextSize,
        cursorSize: document.body.className.match(/accessibility-cursor-(lg|xl|xxl)/)?.[1] || 'normal',
        lineHeight: currentLineHeight,
        letterSpacing: currentLetterSpacing,
        focusHighlight: document.body.classList.contains('accessibility-focus-highlight')
    };
    chrome.storage.sync.set(state);
}