// fakeCall.js - Logic for the Decoy Incoming Call Screen

const FakeCallAudio = {
    ctx: null,
    osc1: null,
    osc2: null,
    gainNode: null,
    interval: null,
    startRingtone: function() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return; // Not supported
            this.ctx = new AudioContext();
        }
        
        // Resume if suspended
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.stopRingtone();
        
        const playRing = () => {
            if (!this.ctx) return;
            this.osc1 = this.ctx.createOscillator();
            this.osc2 = this.ctx.createOscillator();
            this.gainNode = this.ctx.createGain();
            
            this.osc1.type = 'sine';
            this.osc2.type = 'sine';
            
            // Standard North American ringtone frequencies (440Hz and 480Hz)
            this.osc1.frequency.setValueAtTime(440, this.ctx.currentTime); 
            this.osc2.frequency.setValueAtTime(480, this.ctx.currentTime); 
            
            this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.05);
            this.gainNode.gain.setValueAtTime(0.5, this.ctx.currentTime + 1.95);
            this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2.0);
            
            this.osc1.connect(this.gainNode);
            this.osc2.connect(this.gainNode);
            this.gainNode.connect(this.ctx.destination);
            
            this.osc1.start(this.ctx.currentTime);
            this.osc2.start(this.ctx.currentTime);
            this.osc1.stop(this.ctx.currentTime + 2.0);
            this.osc2.stop(this.ctx.currentTime + 2.0);
        };
        
        playRing();
        this.interval = setInterval(playRing, 4000); // 2s ring, 2s silence
    },
    stopRingtone: function() {
        if (this.interval) clearInterval(this.interval);
        if (this.gainNode && this.ctx) {
            try { this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1); } catch(e){}
        }
        if (this.osc1 && this.ctx) {
            try { this.osc1.stop(this.ctx.currentTime + 0.1); } catch(e){}
        }
        if (this.osc2 && this.ctx) {
            try { this.osc2.stop(this.ctx.currentTime + 0.1); } catch(e){}
        }
    }
};

const SafeSpaceFakeCall = {
    callTimerInterval: null,
    secondsElapsed: 0,
    
    init: () => {
        const triggerBtn = document.getElementById('trigger-fake-call');
        if (triggerBtn) {
            triggerBtn.addEventListener('click', SafeSpaceFakeCall.scheduleCall);
        }

        const acceptBtn = document.getElementById('fc-accept-btn');
        const declineBtn = document.getElementById('fc-decline-btn');
        const hangupBtn = document.getElementById('fc-hangup-btn');
        
        if(acceptBtn) acceptBtn.addEventListener('click', SafeSpaceFakeCall.acceptCall);
        if(declineBtn) declineBtn.addEventListener('click', SafeSpaceFakeCall.endCall);
        if(hangupBtn) hangupBtn.addEventListener('click', SafeSpaceFakeCall.endCall);
    },

    scheduleCall: (e) => {
        if (e) e.preventDefault();
        const settings = SafeSpaceStorage.getFakeCallInfo();
        const delaySeconds = parseFloat(settings.delay) || 3;
        
        // Show subtle indicator if needed, but discreet is better.
        setTimeout(SafeSpaceFakeCall.startRinging, delaySeconds * 1000);
    },

    startRinging: () => {
        const settings = SafeSpaceStorage.getFakeCallInfo();
        const callerName = settings.callerName || 'Mom';
        
        document.getElementById('fc-caller-name').innerText = callerName;
        document.getElementById('fc-active-caller-name').innerText = callerName;
        
        document.getElementById('incoming-call-ui').classList.remove('d-none');
        document.getElementById('active-call-ui').classList.add('d-none');
        document.getElementById('fake-call-overlay').classList.remove('d-none');
        
        // Browsers require user interaction before playing audio, 
        // clicking the trigger button satisfies this for the AudioContext.
        FakeCallAudio.startRingtone();
    },

    acceptCall: () => {
        FakeCallAudio.stopRingtone();
        document.getElementById('incoming-call-ui').classList.add('d-none');
        document.getElementById('active-call-ui').classList.remove('d-none');
        
        SafeSpaceFakeCall.secondsElapsed = 0;
        SafeSpaceFakeCall.updateTimerDisplay();
        SafeSpaceFakeCall.callTimerInterval = setInterval(() => {
            SafeSpaceFakeCall.secondsElapsed++;
            SafeSpaceFakeCall.updateTimerDisplay();
        }, 1000);
    },

    endCall: () => {
        FakeCallAudio.stopRingtone();
        clearInterval(SafeSpaceFakeCall.callTimerInterval);
        document.getElementById('fake-call-overlay').classList.add('d-none');
    },

    updateTimerDisplay: () => {
        const m = Math.floor(SafeSpaceFakeCall.secondsElapsed / 60).toString().padStart(2, '0');
        const s = (SafeSpaceFakeCall.secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('fc-timer').innerText = `${m}:${s}`;
    }
};

document.addEventListener('DOMContentLoaded', SafeSpaceFakeCall.init);
