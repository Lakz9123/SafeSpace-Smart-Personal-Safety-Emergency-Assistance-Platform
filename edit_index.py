import codecs

with codecs.open('e:/Desktop/SafeSpace/index.html', 'r', 'utf-8') as f:
    content = f.read()

voice_indicator_start = content.find('<!-- Mic Indicator -->')
voice_indicator_end = content.find('<p class="mt-4', voice_indicator_start)

if voice_indicator_start != -1 and voice_indicator_end != -1:
    new_indicators = '''<!-- Indicators -->
                    <div id="indicators-container" class="position-absolute start-0 top-0 mt-4 ms-md-4 ms-2 d-flex flex-column gap-2">
                        <div id="voice-indicator" class="d-none" title="Voice listening active">
                            <span class="voice-pulse text-primary" style="font-size: 1.25rem;">🎙️</span>
                        </div>
                        <div id="shake-indicator" class="d-none" title="Shake detection active">
                            <span class="alert-pulse text-danger" style="font-size: 1.25rem;">📳</span>
                        </div>
                    </div>
                    '''
    content = content[:voice_indicator_start] + new_indicators + content[voice_indicator_end:]

voice_card_idx = content.find('id="voiceForm">')
if voice_card_idx != -1:
    voice_card_end = content.find('</div>', content.find('</form>', voice_card_idx)) + 6
    shake_card = '''
                    <!-- Shake Detection Settings -->
                    <div class="glass-card p-4 mb-4" id="shake-settings-card">
                        <h4 class="fw-bold mb-4">Shake-to-Alert</h4>
                        <div id="shake-unsupported-msg" class="d-none text-warning mb-3">
                            <small>Motion detection is not supported on this device or browser.</small>
                        </div>
                        <form id="shakeForm">
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" role="switch" id="shakeEnableToggle">
                                <label class="form-check-label text-muted fw-semibold" for="shakeEnableToggle">Enable Shake SOS (Shake device rapidly to trigger)</label>
                            </div>
                        </form>
                    </div>
'''
    content = content[:voice_card_end] + shake_card + content[voice_card_end:]

with codecs.open('e:/Desktop/SafeSpace/index.html', 'w', 'utf-8') as f:
    f.write(content)
print("done")
