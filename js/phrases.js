// phrases.js - Multi-language Emergency Phrases using SpeechSynthesis

const SafeSpacePhrases = {
    phrasesData: null,
    
    init: async () => {
        try {
            const response = await fetch('./data/phrases.json');
            SafeSpacePhrases.phrasesData = await response.json();
            SafeSpacePhrases.renderLanguageSelectors();
            
            // Load saved language or default to English
            const savedLang = localStorage.getItem('safespace_phrase_lang') || 'en';
            SafeSpacePhrases.changeLanguage(savedLang);
            
            // Listen to selector changes
            const profileSelector = document.getElementById('phrase-lang-selector-profile');
            if (profileSelector) {
                profileSelector.addEventListener('change', (e) => {
                    SafeSpacePhrases.changeLanguage(e.target.value);
                });
            }
            
            const dashSelector = document.getElementById('phrase-lang-selector-dash');
            if (dashSelector) {
                dashSelector.addEventListener('change', (e) => {
                    SafeSpacePhrases.changeLanguage(e.target.value);
                });
            }
        } catch (err) {
            console.error("Failed to load emergency phrases:", err);
        }
    },
    
    renderLanguageSelectors: () => {
        if (!SafeSpacePhrases.phrasesData) return;
        
        let optionsHtml = '';
        for (const [code, data] of Object.entries(SafeSpacePhrases.phrasesData)) {
            optionsHtml += `<option value="${code}">${data.name}</option>`;
        }
        
        const profileSelector = document.getElementById('phrase-lang-selector-profile');
        if (profileSelector) profileSelector.innerHTML = optionsHtml;
        
        const dashSelector = document.getElementById('phrase-lang-selector-dash');
        if (dashSelector) dashSelector.innerHTML = optionsHtml;
    },
    
    changeLanguage: (langCode) => {
        if (!SafeSpacePhrases.phrasesData || !SafeSpacePhrases.phrasesData[langCode]) {
            langCode = 'en';
        }
        
        localStorage.setItem('safespace_phrase_lang', langCode);
        
        const profileSelector = document.getElementById('phrase-lang-selector-profile');
        if (profileSelector) profileSelector.value = langCode;
        
        const dashSelector = document.getElementById('phrase-lang-selector-dash');
        if (dashSelector) dashSelector.value = langCode;
        
        SafeSpacePhrases.renderPhrases(langCode, 'phrases-list-profile');
        SafeSpacePhrases.renderPhrases(langCode, 'phrases-list-dash');
    },
    
    renderPhrases: (langCode, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const data = SafeSpacePhrases.phrasesData[langCode];
        if (!data) return;
        
        const btnLabels = {
            'en': '🗣 Speak',
            'es': '🗣 Hablar',
            'hi': '🗣 बोलें',
            'fr': '🗣 Parler',
            'ta': '🗣 பேசு'
        };
        const btnLabel = btnLabels[langCode] || '🗣 Speak';
        
        let html = '';
        data.phrases.forEach(phrase => {
            html += `
                <div class="d-flex justify-content-between align-items-center mb-2 p-2 rounded" style="background: var(--card-bg); border: 1px solid var(--border-color);">
                    <span class="fw-semibold text-break me-2">${phrase}</span>
                    <button class="btn btn-sm btn-primary flex-shrink-0" onclick="SafeSpacePhrases.speak('${phrase}', '${data.voiceLang}')">
                        ${btnLabel}
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    speak: (text, langCode) => {
        if (!('speechSynthesis' in window)) {
            alert("Sorry, your browser doesn't support text-to-speech.");
            return;
        }
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = 0.9; // Slightly slower for clarity
        
        window.speechSynthesis.speak(utterance);
    }
};
