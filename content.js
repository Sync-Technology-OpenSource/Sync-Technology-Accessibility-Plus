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
    }
    sendResponse({ status: "success" });
});