// xmlHandler.js - XMLSerializer and DOMParser for Safety Profiles (with AES-GCM Encryption)

const CryptoUtils = {
    // Generate key from password using PBKDF2
    deriveKey: async (password, salt) => {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            "PBKDF2",
            false,
            ["deriveBits", "deriveKey"]
        );
        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    },
    
    encrypt: async (text, password) => {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const key = await CryptoUtils.deriveKey(password, salt);
        
        const enc = new TextEncoder();
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            enc.encode(text)
        );
        
        return {
            encrypted: true,
            salt: CryptoUtils.bufferToBase64(salt),
            iv: CryptoUtils.bufferToBase64(iv),
            data: CryptoUtils.bufferToBase64(encrypted)
        };
    },
    
    decrypt: async (envelope, password) => {
        const salt = CryptoUtils.base64ToBuffer(envelope.salt);
        const iv = CryptoUtils.base64ToBuffer(envelope.iv);
        const data = CryptoUtils.base64ToBuffer(envelope.data);
        
        const key = await CryptoUtils.deriveKey(password, salt);
        
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            data
        );
        
        const dec = new TextDecoder();
        return dec.decode(decrypted);
    },
    
    bufferToBase64: (buf) => {
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    },
    
    base64ToBuffer: (base64) => {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
};

const SafeSpaceXML = {
    pendingEncryptedData: null,

    exportProfile: async () => {
        const encryptToggle = document.getElementById('encryptExportToggle');
        const pwdInput = document.getElementById('export-password');
        const isEncrypted = encryptToggle && encryptToggle.checked;
        const password = pwdInput ? pwdInput.value : '';

        if (isEncrypted && !password) {
            alert("Please enter a passphrase to encrypt your export.");
            return;
        }

        const doc = document.implementation.createDocument("", "", null);
        const root = doc.createElement("SafetyProfile");
        doc.appendChild(root);

        // User Medical Info
        const userNode = doc.createElement("User");
        const medical = SafeSpaceStorage.getMedicalInfo();
        
        const nameNode = doc.createElement("Name");
        nameNode.textContent = medical.name || "";
        userNode.appendChild(nameNode);
        
        const bloodNode = doc.createElement("BloodType");
        bloodNode.textContent = medical.bloodType || "";
        userNode.appendChild(bloodNode);
        
        const condNode = doc.createElement("MedicalConditions");
        condNode.textContent = medical.conditions || "";
        userNode.appendChild(condNode);
        
        root.appendChild(userNode);

        // Contacts
        const contactsNode = doc.createElement("EmergencyContacts");
        const contacts = SafeSpaceStorage.getContacts();
        contacts.forEach(c => {
            const cNode = doc.createElement("Contact");
            cNode.setAttribute("id", c.id);
            
            const cName = doc.createElement("Name");
            cName.textContent = c.name;
            cNode.appendChild(cName);
            
            const cRel = doc.createElement("Relation");
            cRel.textContent = c.relation;
            cNode.appendChild(cRel);
            
            const cPhone = doc.createElement("Phone");
            cPhone.textContent = c.phone;
            cNode.appendChild(cPhone);
            
            contactsNode.appendChild(cNode);
        });
        root.appendChild(contactsNode);

        // History
        const historyNode = doc.createElement("AlertHistory");
        const history = SafeSpaceStorage.getHistory();
        history.forEach(h => {
            const hNode = doc.createElement("Event");
            hNode.setAttribute("id", h.id);
            hNode.setAttribute("timestamp", h.timestamp);
            hNode.setAttribute("type", h.type);
            hNode.setAttribute("status", h.status);
            
            const hDetails = doc.createElement("Details");
            hDetails.textContent = h.details;
            hNode.appendChild(hDetails);
            
            historyNode.appendChild(hNode);
        });
        root.appendChild(historyNode);

        // Serialize
        const serializer = new XMLSerializer();
        const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(doc);
        
        let outputData = xmlString;
        let fileType = "application/xml";
        let ext = ".xml";

        if (isEncrypted) {
            try {
                const envelope = await CryptoUtils.encrypt(xmlString, password);
                outputData = JSON.stringify(envelope);
                fileType = "application/json";
                ext = ".json";
            } catch (err) {
                console.error("Encryption failed:", err);
                alert("Encryption failed. See console for details.");
                return;
            }
        }

        const blob = new Blob([outputData], { type: fileType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `safety-profile${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    importProfile: (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileString = e.target.result;
            
            // Check if it's our encrypted JSON envelope
            let isEncrypted = false;
            let envelope = null;
            try {
                envelope = JSON.parse(fileString);
                if (envelope && envelope.encrypted) {
                    isEncrypted = true;
                }
            } catch (e) {
                // Not JSON, assume raw XML
            }

            if (isEncrypted) {
                SafeSpaceXML.pendingEncryptedData = envelope;
                const modal = new bootstrap.Modal(document.getElementById('importPasswordModal'));
                document.getElementById('import-password').value = '';
                document.getElementById('import-error-msg').classList.add('d-none');
                modal.show();
            } else {
                SafeSpaceXML.parseAndImportXML(fileString);
            }
        };
        reader.readAsText(file);
    },

    attemptDecryption: async () => {
        const pwd = document.getElementById('import-password').value;
        const errorMsg = document.getElementById('import-error-msg');
        
        if (!pwd) {
            errorMsg.innerText = "Please enter a passphrase.";
            errorMsg.classList.remove('d-none');
            return;
        }

        try {
            const decryptedXml = await CryptoUtils.decrypt(SafeSpaceXML.pendingEncryptedData, pwd);
            
            // Hide modal
            const modalEl = document.getElementById('importPasswordModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            
            SafeSpaceXML.pendingEncryptedData = null;
            
            // Proceed to import
            SafeSpaceXML.parseAndImportXML(decryptedXml);
        } catch (err) {
            console.error("Decryption failed:", err);
            errorMsg.innerText = "Incorrect passphrase or corrupted file.";
            errorMsg.classList.remove('d-none');
        }
    },

    parseAndImportXML: (xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            alert("Error parsing XML profile. Please ensure it's a valid SafeSpace XML file or the decryption was successful.");
            return;
        }

        // Parse Medical Info
        const userNode = xmlDoc.getElementsByTagName("User")[0];
        if (userNode) {
            const name = userNode.getElementsByTagName("Name")[0]?.textContent || "";
            const bloodType = userNode.getElementsByTagName("BloodType")[0]?.textContent || "";
            const conditions = userNode.getElementsByTagName("MedicalConditions")[0]?.textContent || "";
            SafeSpaceStorage.saveMedicalInfo({ name, bloodType, conditions });
        }

        // Parse Contacts
        const contactsNode = xmlDoc.getElementsByTagName("EmergencyContacts")[0];
        if (contactsNode) {
            const contactEls = contactsNode.getElementsByTagName("Contact");
            const newContacts = [];
            for (let i = 0; i < contactEls.length; i++) {
                const c = contactEls[i];
                newContacts.push({
                    id: c.getAttribute("id") || 'contact_' + Date.now() + i,
                    name: c.getElementsByTagName("Name")[0]?.textContent || "",
                    relation: c.getElementsByTagName("Relation")[0]?.textContent || "",
                    phone: c.getElementsByTagName("Phone")[0]?.textContent || ""
                });
            }
            SafeSpaceStorage.saveData('contacts', newContacts);
        }

        // Parse History
        const historyNode = xmlDoc.getElementsByTagName("AlertHistory")[0];
        if (historyNode) {
            const eventEls = historyNode.getElementsByTagName("Event");
            const newHistory = [];
            for (let i = 0; i < eventEls.length; i++) {
                const ev = eventEls[i];
                newHistory.push({
                    id: ev.getAttribute("id"),
                    timestamp: parseInt(ev.getAttribute("timestamp"), 10),
                    type: ev.getAttribute("type"),
                    status: ev.getAttribute("status"),
                    details: ev.getElementsByTagName("Details")[0]?.textContent || ""
                });
            }
            SafeSpaceStorage.saveData('history', newHistory);
        }

        alert("Safety Profile imported successfully!");
        
        // Trigger UI refresh
        if (window.refreshContactsList) refreshContactsList();
        if (window.refreshHistoryList) refreshHistoryList();
        if (window.loadMedicalInfo) loadMedicalInfo();
    }
};
