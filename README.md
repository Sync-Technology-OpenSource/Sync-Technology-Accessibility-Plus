# Sync Technology Accessibility Plus
 
The goal of Sync-Technology-Accessibility-Plus is to enhance the user experience on websites by providing powerful accessibility and comfort features under the official Sync Technology branding.
 
## 🚀 Features
 
* **Visual Comfort:** High contrast mode, link underlining, and custom font sizing.
* **Typography:** OpenDyslexic font support to assist users with reading difficulties.
* **Cursor Adaptation:** Custom progressive XXL cursor sizes for better visibility and navigation.
* **Audio Assistance:** Built-in text-to-speech page reading functionality to read web content aloud.

## ⭐ Preset Profiles (v1.3)
The extension includes a dedicated **Preset Profiles** tab allowing users to apply instant configuration bundles:

* **📖 Dyslexia Profile:** Applies optimized fonts, `1.5` line spacing, and adjusted letter spacing.
* **👁️ Visual Impairment & Contrast:** Enables high contrast mode, scales text to `140%`, and activates the XXL cursor.
* **⌨️ Keyboard Navigation:** Enhances keyboard focus outlines and underlines all page links.

### Smart Toggle & Active State Logic
* **Visual Feedback:** The currently active preset profile is clearly highlighted in the popup interface with a distinct blue border and background styling (`.profile-card.active`).
* **Toggle Behavior:** Clicking an active profile again deactivates it and resets the page. Switching between profiles seamlessly clears the previous state without style conflicts.

## 📁 Repository Structure
 
* `manifest.json` : Extension manifest configuration (Manifest V3).
* `popup.html` & `popup.js` : Extension popup interface, persistent state management (`chrome.storage.sync`), and UI logic.
* `content.js` : Core accessibility logic injected into web pages via messaging.
* `background.js` : Service worker for background extension lifecycle management.
* `accessibility-plus.js` : Additional modular logic for advanced extension features.
* `accessibility.css` : Stylesheets for visual and cursor adaptations.
* `icons/` : Official brand assets and extension icons.
* `.gitignore` : Git ignore configuration.
* `LICENSE` : Open-source license terms.

## 📄 License
 
This project is open-source and available under the [MIT License](LICENSE).