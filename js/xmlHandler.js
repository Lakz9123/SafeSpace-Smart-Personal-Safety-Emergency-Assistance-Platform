// xmlHandler.js - XMLSerializer and DOMParser for Safety Profiles

const SafeSpaceXML = {
    exportProfile: () => {
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

        // Serialize and trigger download
        const serializer = new XMLSerializer();
        const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(doc);
        
        const blob = new Blob([xmlString], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'safety-profile.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    importProfile: (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const xmlString = e.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            
            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                alert("Error parsing XML profile. Please ensure it's a valid SafeSpace XML file.");
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
        };
        reader.readAsText(file);
    }
};
