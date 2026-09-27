// voiceControl.js - Web Speech API Voice Activation

const SafeSpaceVoice = {
    recognition: null,
    isListening: false,
    shouldListen: false,
    phrase: '',

    init: () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            const msgEl = document.getElementById('voice-unsupported-msg');
            const toggleEl = document.getElementById('voiceEnableToggle');
            if (msgEl) msgEl.classList.remove('d-none');
            if (toggleEl) toggleEl.disabled = true;
            return;
        }

        SafeSpaceVoice.recognition = new SpeechRecognition();
        SafeSpaceVoice.recognition.continuous = true;
        SafeSpaceVoice.recognition.interimResults = true;
        SafeSpaceVoice.recognition.lang = 'en-US';

        SafeSpaceVoice.recognition.onstart = () => {
            SafeSpaceVoice.isListening = true;
            SafeSpaceVoice.updateIndicator(true);
        };

        SafeSpaceVoice.recognition.onresult = (event) => {
            let finalTranscript = '';
            const targetPhrase = SafeSpaceVoice.phrase.toLowerCase();
            
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript.toLowerCase();
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    // Trigger on interim to be as fast as possible
                    if (targetPhrase && transcript.includes(targetPhrase)) {
                        SafeSpaceVoice.trigger();
                        return;
                    }
                }
            }

            if (targetPhrase && finalTranscript.includes(targetPhrase)) {
                SafeSpaceVoice.trigger();
            }
        };

        SafeSpaceVoice.recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                SafeSpaceVoice.shouldListen = false;
                SafeSpaceVoice.updateIndicator(false);
                alert("Microphone permission denied. Voice SOS has been disabled.");
                
                // Update storage & UI
                const settings = SafeSpaceStorage.getVoiceSettings();
                settings.enabled = false;
                SafeSpaceStorage.saveVoiceSettings(settings);
                const toggleEl = document.getElementById('voiceEnableToggle');
                if (toggleEl) toggleEl.checked = false;
            }
        };

        SafeSpaceVoice.recognition.onend = () => {
            SafeSpaceVoice.isListening = false;
            SafeSpaceVoice.updateIndicator(false);
            if (SafeSpaceVoice.shouldListen) {
                // Restart listening to keep it continuous
                try {
                    SafeSpaceVoice.recognition.start();
                } catch(e) {}
            }
        };

        SafeSpaceVoice.reloadSettings();
    },

    trigger: () => {
        if (!SafeSpaceCore) return;
        SafeSpaceCore.triggerSOS('voice');
        // Pause briefly after trigger
        SafeSpaceVoice.shouldListen = false;
        SafeSpaceVoice.stop();
        // Resume after 10s
        setTimeout(() => {
            const settings = SafeSpaceStorage.getVoiceSettings();
            if (settings.enabled) {
                SafeSpaceVoice.shouldListen = true;
                SafeSpaceVoice.reloadSettings();
            }
        }, 10000);
    },

    reloadSettings: () => {
        const settings = SafeSpaceStorage.getVoiceSettings();
        SafeSpaceVoice.phrase = settings.phrase.trim();
        SafeSpaceVoice.shouldListen = settings.enabled;

        if (SafeSpaceVoice.shouldListen && !SafeSpaceVoice.isListening && SafeSpaceVoice.recognition) {
            try {
                SafeSpaceVoice.recognition.start();
            } catch(e) {}
        } else if (!SafeSpaceVoice.shouldListen && SafeSpaceVoice.isListening && SafeSpaceVoice.recognition) {
            SafeSpaceVoice.stop();
        }
    },

    stop: () => {
        if (SafeSpaceVoice.recognition) {
            try { SafeSpaceVoice.recognition.stop(); } catch(e){}
        }
    },

    updateIndicator: (active) => {
        const indicator = document.getElementById('voice-indicator');
        if (!indicator) return;
        if (active) {
            indicator.classList.remove('d-none');
        } else {
            indicator.classList.add('d-none');
        }
    }
};
