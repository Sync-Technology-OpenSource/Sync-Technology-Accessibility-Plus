/**
 * Sync-Technology-Accessibility-Plus
 * Core JavaScript module for typography, contrast, and visual comfort.
 * Licensed under the MIT License.
 */

(function (window, document) {
    'use strict';

    class AccessibilityPlus {
        constructor(options = {}) {
            this.options = Object.assign({
                defaultFontSize: 100, // En pourcentage
                maxFontSize: 150,
                minFontSize: 90,
                step: 10
            }, options);

            this.currentFontSize = this.options.defaultFontSize;
            this.init();
        }

        init() {
            console.log('Sync Technology Accessibility Plus initialized.');
            // Ici, on pourra injecter dynamiquement le panneau d'options dans la page
        }

        // Fonction pour ajuster la taille du texte global
        changeFontSize(action) {
            if (action === 'increase' && this.currentFontSize < this.options.maxFontSize) {
                this.currentFontSize += this.options.step;
            } else if (action === 'decrease' && this.currentFontSize > this.options.minFontSize) {
                this.currentFontSize -= this.options.step;
            } else if (action === 'reset') {
                this.currentFontSize = this.options.defaultFontSize;
            }

            document.documentElement.style.fontSize = this.currentFontSize + '%';
            return this.currentFontSize;
        }

        // Fonction pour basculer le mode haut contraste
        toggleHighContrast() {
            document.body.classList.toggle('accessibility-high-contrast');
        }
    }

    // Exposition globale de la classe pour une utilisation facile
    window.AccessibilityPlus = AccessibilityPlus;

})(window, document);