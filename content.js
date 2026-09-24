let currentUtterance = null;

// Écouteur de messages venant de la popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle-contrast") {
        document.body.classList.toggle('accessibility-high-contrast');
    }
    if (request.action === "toggle-underline") {
        document.body.classList.toggle('accessibility-underline-links');
    }
    if (request.action === "toggle-dyslexic") {
        document.body.classList.toggle('accessibility-dyslexic');
    }
    if (request.action === "set-text-size") {
        document.documentElement.style.fontSize = request.value + '%';
    }
    if (request.action === "set-cursor") {
        const body = document.body;
        body.classList.remove('accessibility-cursor-lg', 'accessibility-cursor-xl', 'accessibility-cursor-xxl');
        if (request.value !== 'normal') {
            body.classList.add('accessibility-cursor-' + request.value);
        }
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
        window.speechSynthesis.cancel();
    }
    
    // Fonctionnalité Audio (Text-to-Speech)
    if (request.action === "read-page") {
        window.speechSynthesis.cancel(); // Arrête toute lecture en cours
        
        // Récupère le texte pertinent de la page (titres, paragraphes, listes)
        const textElements = document.querySelectorAll('h1, h2, h3, p, li');
        let textToRead = "";
        
        textElements.forEach(el => {
            if (el.offsetParent !== null) { // Vérifie que l'élément est visible à l'écran
                textToRead += el.innerText + ". ";
            }
        });

        if (textToRead.trim() === "") {
            textToRead = document.body.innerText; // Fallback sur tout le texte si besoin
        }

        currentUtterance = new SpeechSynthesisUtterance(textToRead);
        currentUtterance.lang = 'fr-FR'; // Définit la langue en français
        currentUtterance.rate = 1.0; // Vitesse de lecture normale

        window.speechSynthesis.speak(currentUtterance);
        sendResponse({ status: "reading" });
        return;
    }

    if (request.action === "stop-audio") {
        window.speechSynthesis.cancel();
        sendResponse({ status: "stopped" });
        return;
    }

    sendResponse({ status: "success" });
});