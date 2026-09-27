// i18n.js - Language Localization

const SafeSpaceI18n = {
    currentLang: 'en',
    
    dictionary: {
        en: {
            "nav_dashboard": "Dashboard",
            "nav_profile": "Profile",
            "offline_banner": "You are offline. Alerts will be queued.",
            "sos_button": "SOS",
            "sos_hold": "HOLD FOR 3 SECONDS TO TRIGGER ALERT",
            "auto_checkin_title": "Auto Check-in",
            "auto_checkin_desc": "Automatically trigger SOS if you don't check in within the set time.",
            "start_timer": "Start Timer",
            "stop_timer": "Stop Timer",
            "contacts_title": "Emergency Contacts",
            "add_contact": "+ Add New Contact",
            "no_contacts": "No contacts added yet. Add one to get started.",
            "places_title": "Nearby Safe Places",
            "fetching_loc": "Fetching location...",
            "finding_places": "Finding safe places...",
            "no_places": "No nearby places found.",
            "history_title": "Alert History",
            "no_history": "No alerts triggered yet.",
            "med_info_title": "Medical Information",
            "save_med_info": "Save Info",
            "fake_call_title": "Fake Call (Decoy)",
            "fake_call_desc": "Simulate an incoming phone call to gracefully exit an uncomfortable situation.",
            "save_call_settings": "Save Call Settings",
            "voice_title": "Voice Activation",
            "save_voice_settings": "Save Voice Settings",
            "shake_title": "Shake-to-Alert",
            "enable_shake": "Enable Shake SOS (Shake device rapidly to trigger)",
            "fm_history_title": "Past \"Follow Me\" Sessions",
            "xml_title": "XML Data Management",
            "export_btn": "⬇ Export XML Profile",
            "import_btn": "⬆ Import XML Profile",
            "encrypt_export": "Encrypt this export",
            "loc_unavailable": "Location unavailable",
            "sos_triggered": "SOS Triggered",
            "auto_triggered": "Auto-Triggered SOS",
            "queued": "Queued (Offline)",
            "synced": "Sent (Synced)",
            "active": "Active",
            "miles_away": "miles away"
        },
        es: {
            "nav_dashboard": "Tablero",
            "nav_profile": "Perfil",
            "offline_banner": "Estás desconectado. Las alertas se pondrán en cola.",
            "sos_button": "SOS",
            "sos_hold": "MANTENGA DURANTE 3 SEGUNDOS PARA ACTIVAR ALERTA",
            "auto_checkin_title": "Registro Automático",
            "auto_checkin_desc": "Activa el SOS automáticamente si no te registras a tiempo.",
            "start_timer": "Iniciar Temporizador",
            "stop_timer": "Detener Temporizador",
            "contacts_title": "Contactos de Emergencia",
            "add_contact": "+ Añadir Nuevo Contacto",
            "no_contacts": "Aún no se han añadido contactos.",
            "places_title": "Lugares Seguros Cercanos",
            "fetching_loc": "Obteniendo ubicación...",
            "finding_places": "Buscando lugares seguros...",
            "no_places": "No se encontraron lugares cercanos.",
            "history_title": "Historial de Alertas",
            "no_history": "No se han activado alertas.",
            "med_info_title": "Información Médica",
            "save_med_info": "Guardar Info",
            "fake_call_title": "Llamada Falsa (Señuelo)",
            "fake_call_desc": "Simula una llamada entrante para salir de una situación incómoda.",
            "save_call_settings": "Guardar Ajustes de Llamada",
            "voice_title": "Activación por Voz",
            "save_voice_settings": "Guardar Ajustes de Voz",
            "shake_title": "Agitar para Alertar",
            "enable_shake": "Activar SOS por Agitación (Agite el dispositivo)",
            "fm_history_title": "Sesiones Pasadas \"Sígueme\"",
            "xml_title": "Gestión de Datos XML",
            "export_btn": "⬇ Exportar Perfil XML",
            "import_btn": "⬆ Importar Perfil XML",
            "encrypt_export": "Encriptar esta exportación",
            "loc_unavailable": "Ubicación no disponible",
            "sos_triggered": "SOS Activado",
            "auto_triggered": "SOS Automático",
            "queued": "En cola (Desconectado)",
            "synced": "Enviado (Sincronizado)",
            "active": "Activo",
            "miles_away": "millas de distancia"
        },
        fr: {
            "nav_dashboard": "Tableau de bord",
            "nav_profile": "Profil",
            "offline_banner": "Vous êtes hors ligne. Les alertes seront mises en file d'attente.",
            "sos_button": "SOS",
            "sos_hold": "MAINTENEZ 3 SECONDES POUR DÉCLENCHER L'ALERTE",
            "auto_checkin_title": "Enregistrement Auto",
            "auto_checkin_desc": "Déclenchez SOS automatiquement si vous ne vous enregistrez pas à temps.",
            "start_timer": "Démarrer le Minuteur",
            "stop_timer": "Arrêter le Minuteur",
            "contacts_title": "Contacts d'Urgence",
            "add_contact": "+ Ajouter un Contact",
            "no_contacts": "Aucun contact ajouté.",
            "places_title": "Lieux Sûrs à Proximité",
            "fetching_loc": "Obtention de l'emplacement...",
            "finding_places": "Recherche de lieux sûrs...",
            "no_places": "Aucun lieu trouvé à proximité.",
            "history_title": "Historique des Alertes",
            "no_history": "Aucune alerte déclenchée.",
            "med_info_title": "Informations Médicales",
            "save_med_info": "Enregistrer Info",
            "fake_call_title": "Faux Appel",
            "fake_call_desc": "Simulez un appel entrant pour quitter une situation inconfortable.",
            "save_call_settings": "Enregistrer les Paramètres",
            "voice_title": "Activation Vocale",
            "save_voice_settings": "Enregistrer Paramètres Vocaux",
            "shake_title": "Secouer pour Alerter",
            "enable_shake": "Activer Secousse SOS",
            "fm_history_title": "Sessions \"Suivez-moi\" passées",
            "xml_title": "Gestion des Données XML",
            "export_btn": "⬇ Exporter Profil XML",
            "import_btn": "⬆ Importer Profil XML",
            "encrypt_export": "Crypter cette exportation",
            "loc_unavailable": "Emplacement indisponible",
            "sos_triggered": "SOS Déclenché",
            "auto_triggered": "SOS Auto-Déclenché",
            "queued": "En attente (Hors ligne)",
            "synced": "Envoyé (Synchronisé)",
            "active": "Actif",
            "miles_away": "miles de distance"
        },
        hi: {
            "nav_dashboard": "डैशबोर्ड",
            "nav_profile": "प्रोफ़ाइल",
            "offline_banner": "आप ऑफ़लाइन हैं। अलर्ट कतारबद्ध किए जाएंगे।",
            "sos_button": "एसओएस",
            "sos_hold": "अलर्ट ट्रिगर करने के लिए 3 सेकंड तक दबाए रखें",
            "auto_checkin_title": "ऑटो चेक-इन",
            "auto_checkin_desc": "यदि आप समय पर चेक-इन नहीं करते हैं तो स्वचालित रूप से SOS ट्रिगर करें।",
            "start_timer": "टाइमर शुरू करें",
            "stop_timer": "टाइमर रोकें",
            "contacts_title": "आपातकालीन संपर्क",
            "add_contact": "+ नया संपर्क जोड़ें",
            "no_contacts": "अभी तक कोई संपर्क नहीं जोड़ा गया।",
            "places_title": "आसपास के सुरक्षित स्थान",
            "fetching_loc": "स्थान प्राप्त कर रहा है...",
            "finding_places": "सुरक्षित स्थान खोज रहा है...",
            "no_places": "आसपास कोई स्थान नहीं मिला।",
            "history_title": "अलर्ट इतिहास",
            "no_history": "कोई अलर्ट ट्रिगर नहीं हुआ।",
            "med_info_title": "चिकित्सा जानकारी",
            "save_med_info": "जानकारी सहेजें",
            "fake_call_title": "फर्जी कॉल",
            "fake_call_desc": "असहज स्थिति से बाहर निकलने के लिए आने वाली कॉल का अनुकरण करें।",
            "save_call_settings": "कॉल सेटिंग्स सहेजें",
            "voice_title": "आवाज सक्रियण",
            "save_voice_settings": "ध्वनि सेटिंग्स सहेजें",
            "shake_title": "अलर्ट करने के लिए हिलाएं",
            "enable_shake": "शेक एसओएस सक्षम करें (डिवाइस को तेजी से हिलाएं)",
            "fm_history_title": "पिछले \"मेरे पीछे आओ\" सत्र",
            "xml_title": "XML डेटा प्रबंधन",
            "export_btn": "⬇ XML प्रोफ़ाइल निर्यात करें",
            "import_btn": "⬆ XML प्रोफ़ाइल आयात करें",
            "encrypt_export": "इस निर्यात को एन्क्रिप्ट करें",
            "loc_unavailable": "स्थान अनुपलब्ध",
            "sos_triggered": "एसओएस ट्रिगर",
            "auto_triggered": "ऑटो-ट्रिगर एसओएस",
            "queued": "कतारबद्ध (ऑफ़लाइन)",
            "synced": "भेजा गया (सिंक किया गया)",
            "active": "सक्रिय",
            "miles_away": "मील दूर"
        }
    },

    init: () => {
        let savedLang = localStorage.getItem('safespace_lang');
        if (!savedLang) {
            // Default to browser lang if matches, else en
            const browserLang = navigator.language.substring(0, 2);
            if (['en', 'es', 'fr', 'hi'].includes(browserLang)) {
                savedLang = browserLang;
            } else {
                savedLang = 'en';
            }
        }
        SafeSpaceI18n.setLanguage(savedLang);
        
        // Listen for language selector changes if it exists
        const langSelector = document.getElementById('lang-selector');
        if (langSelector) {
            langSelector.value = savedLang;
            langSelector.addEventListener('change', (e) => {
                SafeSpaceI18n.setLanguage(e.target.value);
            });
        }
    },

    setLanguage: (lang) => {
        if (!SafeSpaceI18n.dictionary[lang]) lang = 'en';
        SafeSpaceI18n.currentLang = lang;
        localStorage.setItem('safespace_lang', lang);
        SafeSpaceI18n.applyTranslations();
    },

    t: (key) => {
        return SafeSpaceI18n.dictionary[SafeSpaceI18n.currentLang][key] || SafeSpaceI18n.dictionary['en'][key] || key;
    },

    applyTranslations: () => {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = SafeSpaceI18n.t(key);
            if (el.tagName === 'INPUT' && el.type === 'button' || el.tagName === 'INPUT' && el.type === 'submit') {
                el.value = translation;
            } else if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = translation; // Some inputs might just need placeholder translation, but this is simple version
                // Actually, if we want placeholder translation we could use data-i18n-placeholder
                el.innerText = translation;
            } else {
                // To preserve internal elements like progress bars in buttons, we might need more complex logic.
                // For simplicity, we just set innerText on pure text nodes.
                
                // Special case for SOS button
                if (el.id === 'sos-text') {
                    el.innerText = translation;
                } else if (el.id === 'export-btn' || el.id === 'import-btn' || el.classList.contains('add-contact-btn')) {
                    el.innerHTML = translation;
                } else {
                    // Try to preserve child nodes if there's only one text node, else just replace
                    // A safe fallback is to just replace textContent, but icons might be lost if not careful
                    if (el.children.length === 0) {
                        el.textContent = translation;
                    } else {
                        // If there are children, maybe just replace the first text node, but this is complex.
                        // Let's just use innerHTML for now. 
                        el.innerHTML = translation;
                    }
                }
            }
        });
        
        // Re-render dynamic lists
        if (typeof refreshHistoryList === 'function') refreshHistoryList();
        if (typeof SafeSpaceDOM !== 'undefined' && SafeSpaceDOM.renderPlaces) {
            // Need to fetch places again or just mock it to trigger translation
            // Usually we'd re-trigger the places fetch, but we can leave it for the next tick
        }
    }
};
