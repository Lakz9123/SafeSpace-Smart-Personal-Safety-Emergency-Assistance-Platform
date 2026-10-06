# SafeSpace – Smart Personal Safety & Emergency Assistance Platform

SafeSpace is a comprehensive, browser-based personal safety web application designed to provide immediate assistance and peace of mind in critical situations. By leveraging cutting-edge web APIs, SafeSpace transforms any modern browser into a powerful emergency tool. It offers multiple discrete and automated ways to trigger SOS alerts, tracks your live location, seamlessly works completely offline as an installable Progressive Web App (PWA), and ensures your data is strictly under your control through encrypted offline backups. 

---

## 🌟 Features

### 🛡️ Core Safety
* **Emergency Dashboard**: A clean, distraction-free interface featuring a large, hold-to-confirm SOS button to prevent accidental triggers.
* **Safety Score & Safe Places**: Evaluates your immediate surroundings and uses OpenStreetMap/Overpass API to locate nearby hospitals, police stations, and safe havens.
* **Emergency Contacts**: Manage local contacts who will be immediately notified (simulated) upon an SOS trigger.

### ⚡ Advanced Trigger Methods
* **Voice SOS**: Trigger an alert hands-free by speaking a customizable safe word.
* **Shake-to-Alert**: Physically shake your mobile device to discreetly trigger an SOS without unlocking your screen.
* **Auto Check-in Timer**: Set a timer before entering a risky situation. If you do not click "I'm Safe" before time runs out, an SOS is automatically triggered.
* **Persistent Panic Widget**: A floating, always-on SOS button that remains accessible across all tabs for instant access.

### 📍 Live Tracking
* **Follow Me Mode**: Logs your breadcrumb trail locally while you commute, estimating distance and duration.
* **Visual Map Integration**: Features an interactive Leaflet map that displays your live location, plots safe places, draws your "Follow Me" route, and allows you to view historical alert locations on demand.

### 🧳 Data Portability
* **Encrypted XML Profiles**: Export your complete profile, contacts, and settings into an AES-GCM encrypted XML file. Data is fully portable and can be safely restored on any device without relying on a central database.

### 🦻 Accessibility & Situational Tools
* **Multi-language Phrases**: Access an emergency phrasebook (e.g., "I need help") translated into English, Spanish, Hindi, French, and Tamil, complete with text-to-speech functionality (SpeechSynthesis) to speak for you in foreign or distressing environments.
* **Fake Call Simulator**: Instantly schedule a highly realistic, simulated incoming phone call to help gracefully exit uncomfortable situations.

### 📶 Offline Support
* **Installable PWA**: Fully installable to your mobile home screen.
* **Offline-First Resilience**: Uses a robust Service Worker strategy to cache assets, ensuring the app remains fully functional without an internet connection. Offline SOS triggers are queued and instantly synchronized when connectivity returns.

---

## 💻 Technologies & APIs

**Core Stack:** HTML5, CSS3, Bootstrap 5, Vanilla JavaScript (ES6+), DOM Manipulation, AJAX (Fetch), JSON, XML (DOMParser/XMLSerializer).

**Advanced Web APIs Utilized:**
* **`Geolocation API`**: High-accuracy GPS polling and tracking.
* **`DeviceMotionEvent`**: Accelerometer integration for Shake-to-Alert.
* **`SpeechRecognition` (Web Speech API)**: Always-listening background voice wake-word detection.
* **`SpeechSynthesis` (Web Speech API)**: Multi-lingual voice playback for emergency phrases.
* **`SubtleCrypto` (Web Crypto API)**: Military-grade AES-GCM encryption with PBKDF2 key derivation for XML backups.
* **`Service Worker` & `Cache API`**: Comprehensive offline PWA caching.
* **`Leaflet.js`**: Lightweight rendering of interactive OpenStreetMap tiles.

---

## 📁 File Structure

```text
SafeSpace/
│
├── index.html                 # Main SPA structure and UI
├── manifest.json              # PWA App Manifest
├── service-worker.js          # Offline caching and queueing
├── README.md                  # Project documentation
│
├── css/
│   ├── style.css              # Theme and core layout styles
│   └── alerts.css             # SOS animations and widget styles
│
├── data/
│   ├── phrases.json           # Multi-language translations
│   └── sample-profile.xml     # Example XML data structure
│
└── js/
    ├── app.js                 # App initialization and SOS orchestration
    ├── api.js                 # Network requests (Overpass API)
    ├── dom.js                 # UI rendering and updates
    ├── fakeCall.js            # Fake call simulator logic
    ├── followMe.js            # Live route tracking logic
    ├── geolocation.js         # GPS wrapper
    ├── i18n.js                # UI Translation manager
    ├── map.js                 # Leaflet map manager
    ├── phrases.js             # Text-to-speech logic
    ├── shakeDetect.js         # Accelerometer handling
    ├── storage.js             # LocalStorage data access layer
    ├── utils.js               # Helper functions
    ├── voiceControl.js        # Speech recognition logic
    └── xmlHandler.js          # XML generation, parsing, and Web Crypto
```

---

## 🚀 Setup & Local Development

Because SafeSpace utilizes advanced device APIs and Service Workers, it **must** be served over a secure origin (HTTPS) or via `localhost`.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lakz9123/SafeSpace-Smart-Personal-Safety-Emergency-Assistance-Platform.git
   cd SafeSpace-Smart-Personal-Safety-Emergency-Assistance-Platform
   ```
2. **Start a local development server:**
   You can use Python's built-in server, Node.js, or any static server.
   ```bash
   python -m http.server 8080
   ```
3. **Access the application:**
   Open your browser and navigate to `http://localhost:8080`.
   *(Note: Using `127.0.0.1:8080` may bypass existing Service Worker caches during active development).*

---

## ⚠️ Browser Compatibility Notes

Due to the reliance on bleeding-edge Web APIs, please note the following constraints:
* **Voice SOS**: Currently relies on `webkitSpeechRecognition`, which is fully supported primarily in **Google Chrome** and Chrome-based Android browsers.
* **Shake-to-Alert**: Requires a mobile device equipped with an accelerometer. iOS 13+ requires the user to explicitly grant permission via the Shake toggle in the Profile tab.
* **Offline Mode (PWA)**: The Service Worker will only register if the application is accessed over HTTPS or `localhost`. 

---

## 🏗️ Architecture Note: The `triggerSOS(source)` Pattern

To maintain a scalable and modular codebase, SafeSpace utilizes a centralized dispatch pattern for all emergency alerts.

Regardless of how an alert is initiated—whether via the main manual button, a spoken safe word, shaking the device, a failed Check-In timer, or the panic widget—the event is routed entirely through a single orchestrator function: `SafeSpaceCore.triggerSOS(source)`. 

This pattern guarantees that every SOS consistently triggers the same critical lifecycle:
1. Fetching the latest GPS coordinates.
2. Generating a standardized timestamped payload.
3. Queueing the payload if offline (for background sync) or dispatching it to the API if online.
4. Saving the event accurately to the local Alert History with its specific `source` tagged.
5. Initiating the global UI `.alert-active` CSS states.
