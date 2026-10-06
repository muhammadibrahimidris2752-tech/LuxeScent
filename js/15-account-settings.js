        // =====================================================================
        // ACCOUNT / SETTINGS
        // Toggle behavior is kept here so the storefront settings remain
        // functional without changing any unrelated storefront/admin code.
        // =====================================================================
        function setToggleUI(key, isOn) {
            const btn = document.getElementById('toggle-' + key);
            if (!btn) return;
            const state = !!isOn;
            btn.setAttribute('aria-checked', String(state));
            btn.setAttribute('aria-label', state
                ? 'Disable ' + key.replace(/([A-Z])/g, ' $1')
                : 'Enable ' + key.replace(/([A-Z])/g, ' $1'));
        }

        function renderAccountScreen() {
            const fullName = (profile.firstName + ' ' + profile.lastName).trim();
            const nameEl = document.getElementById('acct-display-name');
            const emailEl = document.getElementById('acct-display-email');
            if (nameEl) nameEl.innerText = fullName || 'Jane Doe';
            if (emailEl) emailEl.innerText = profile.email || '';
            setToggleUI('orderUpdates', !!appSettings.orderUpdates);
            setToggleUI('emailNotifications', !!appSettings.emailNotifications);
            setToggleUI('sound', !!appSettings.sound);
            setToggleUI('haptic', !!appSettings.haptic);
            bindSettingsToggles();
        }

        function toggleSetting(key) {
            if (!Object.prototype.hasOwnProperty.call(appSettings, key)) return;
            const nextState = !Boolean(appSettings[key]);
            appSettings[key] = nextState;
            persistSettings();
            setToggleUI(key, nextState);

            if (key === 'haptic' && nextState) {
                triggerHaptic();
            }
            if (key === 'sound' && nextState) {
                playNavTapSound();
            }
            if (key === 'orderUpdates') {
                if (nextState) requestBrowserNotifications();
                showToast(nextState ? 'Order updates enabled' : 'Order updates disabled');
            }
            if (key === 'emailNotifications') {
                showToast(nextState ? 'Email notifications enabled' : 'Email notifications disabled');
            }
        }

        function bindSettingsToggles() {
            document.querySelectorAll('.settings-toggle[data-setting]').forEach(function (button) {
                button.onclick = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleSetting(button.dataset.setting);
                };
            });
        }

        function triggerHaptic() {
            try {
                if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                    navigator.vibrate(15);
                }
            } catch (e) {}
        }

        const NAV_TAP_SOUND_DATA = 'data:audio/wav;base64,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sACYAH0AYQBDACQABADm/8f/qf+M/3H/Wf9D/zD/If8V/w3/CP8I/wv/E/8e/yz/Pv9T/2r/hP+g/73/2//6/xgANgBUAHAAigCiALgAygDZAOUA7QDyAPMA7wDpAN4A0AC/AKoAlAB6AF8AQwAlAAcA6v/N/7D/lP96/2P/Tv87/yz/If8Y/xT/E/8W/xz/Jv80/0X/WP9u/4f/of+9/9r/9/8UADEATQBoAIEAmACtAL8AzgDaAOIA5wDoAOUA3wDVAMgAuAClAJAAeABeAEMAJwAKAO//0v+2/5z/g/9s/1j/Rv83/yz/I/8f/x3/IP8l/y//O/9L/13/cv+K/6L/vf/Y//T/DwArAEYAYAB5AI8AowC1AMQAzwDXANwA3gDcANYAzQDBALIAoACMAHUAXQBDACgADQDy/9f/vf+j/4v/df9h/1D/Qv82/y7/Kf8n/yn/Lv83/0P/Uf9j/3b/jP+k/73/1//y/wwAJgBAAFkAcQCGAJoAqwC5AMUAzQDSANQA0gDNAMUAugCsAJsAiAByAFsAQwApAA8A9v/c/8L/qv+T/37/a/9a/0z/QP84/zP/Mf8y/zf/P/9K/1f/aP96/4//pf+9/9b/8P8IACIAOwBTAGkAfgCRAKIAsAC7AMMAyADKAMkAxQC9ALMApgCWAIQAcABaAEMAKgARAPn/4P/I/7D/mv+G/3P/Y/9V/0r/Qv88/zr/O/8//0b/UP9d/2z/fv+S/6f/vv/V/+7/BQAeADUATABiAHYAiQCZAKYAsQC6AL8AwQDAAL0AtgCsAKAAkQCAAG0AWABCACsAEwD8/+X/zf+3/6H/jf97/2v/Xv9T/0v/Rv9D/0T/R/9O/1f/Y/9x/4L/lP+o/77/1f/s/wIAGgAwAEcAXABvAIEAkACeAKkAsQC2ALkAuAC1AK8ApgCaAIwAfABqAFcAQgAsABUA///o/9L/vP+o/5X/g/90/2f/XP9U/07/TP9M/0//Vf9d/2j/dv+G/5f/qv+//9T/6v8AABYALABBAFUAaAB5AIgAlQCgAKgArQCwALAArQCoAJ8AlQCIAHkAaABVAEEALAAXAAEA7P/W/8L/rv+b/4r/fP9v/2T/XP9X/1T/VP9W/1z/ZP9u/3v/if+a/6z/v//U/+n//v8SACgAPABPAGEAcgCBAI0AmACgAKUAqACoAKYAoQCZAI8A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LwAtACoAJgAiAB4AGAATAA0ABwABAPz/9v/w/+r/5f/g/9z/2P/V/9P/0f/Q/9D/0f/S/9T/1//a/97/4//o/+3/8//5////BAAKAA8AFQAaAB8AIwAnACoALAAuAC8ALwAuAC0AKwAoACUAIQAdABgAEwANAAcAAgD9//f/8f/s/+f/4v/e/9r/1//V/9P/0v/S/9P/1P/W/9j/3P/f/+T/6P/t//P/+P/+/wMACQAOABMAGAAdACEAJQAnACoAKwAsAC0ALAArACkAJwAkACAAHAAXABIADQAIAAIA/v/4//P/7f/p/+T/4P/c/9r/1//W/9X/1P/V/9b/1//a/93/4P/k/+n/7v/z//j//v8CAAgADQASABcAGwAfACMAJQAoACkAKgArACoAKQAoACUAIwAfABsAFwASAA0ACAADAP7/+f/0/+//6v/m/+L/3v/c/9n/2P/X/9b/1//X/9n/2//e/+H/5f/p/+7/8//4//3/AQAHAAwAEQAVABkAHQAhACMAJgAnACgAKQApACgAJgAkACEAHgAaABYAEgANAAgAAwD///r/9f/w/+z/5//k/+D/3v/b/9r/2f/Y/9j/2f/b/93/3//i/+b/6v/u//P/+P/9/wEABgALAA8AFAAYABwAHwAiACQAJQAnACcAJwAmACUAIwAgAB0AGgAWABEADQAIAAMAAAD7//b/8f/t/+n/5f/i/9//3f/b/9r/2v/a/9v/3P/e/+D/4//n/+v/7//z//j//P8AAAUACgAOABIAFgAaAB0AIAAiACQAJQAlACUAJAAjACEAHwAcABkAFQARAA0ACAAEAAAA+//3//L/7v/q/+f/5P/h/9//3f/c/9z/3P/c/97/3//i/+T/6P/r/+//8//4//z/AAAEAAkADQARABUAGAAbAB4AIAAiACMAIwAjACMAIgAgAB4AGwAYABUAEQANAAkABAAAAPz/+P/0//D/7P/o/+X/4//h/9//3v/d/93/3v/f/+H/4//l/+j/7P/v//P/9//8/wAAAwAIAAwAEAAUABcAGgAcAB8AIAAhACIAIgAhACAAHwAdABoAFwAUABAADQAJAAQAAAD9//n/9f/x/+3/6v/n/+T/4v/h/+D/3//f/9//4P/i/+T/5v/p/+z/8P/z//f/+/8AAAMABwALAA8AEgAWABgAGwAdAB8AIAAgACAAIAAfAB4AHAAZABcAFAAQAAwACQAFAAEA/f/5//b/8v/u/+v/6P/m/+T/4v/h/+D/4P/h/+L/4//l/+f/6v/t//D/9P/3//v///8CAAYACgAOABEAFAAXABkAGwAdAB4AHwAfAB8AHgAcABsAGAAWABMAEAAMAAkABQABAP7/+v/2//P/8P/s/+r/5//l/+T/4//i/+L/4v/j/+T/5v/o/+r/7f/w//T/9//7////AgAFAAkADQAQABMAFgAYABoAHAAdAB0AHgAdAB0AGwAaABgAFQASAA8ADAAJAAUAAQD///v/9//0//H/7v/r/+n/5//l/+T/4//j/+P/5P/l/+f/6f/r/+7/8f/0//f/+////wEABQAIAAwADwASABQAFwAZABoAGwAcABwAHAAbABoAGQAXABUAEgAPAAwACQAFAAIA///8//j/9f/y/+//7P/q/+j/5v/l/+X/5P/l/+X/5v/o/+r/7P/u//H/9P/3//v//v8BAAQACAALAA4AEQATABUAFwAZABoAGwAbABsAGgAZABgAFgAUABEADwAMAAkABQACAAAA/P/5//b/8//w/+3/6//p/+j/5//m/+b/5v/m/+f/6f/q/+z/7//x//T/9//7//7/AAAEAAcACgANABAAEgAUABYAGAAZABkAGgAaABkAGAAXABUAEwARAA4ADAAJAAUAAgAAAP3/+v/2//T/8f/u/+z/6//p/+j/5//n/+f/5//o/+r/6//t/+//8v/1//j/+//+/wAAAwAGAAkADAAPABEAEwAVABYAFwAYABkAGAAYABcAFgAUABMAEAAOAAsACAAFAAIAAAD9//r/9//0//L/8P/t/+z/6v/p/+j/6P/o/+j/6f/q/+z/7v/w//L/9f/4//r//f8AAAMABQAIAAsADgAQABIAFAAVABYAFwAXABcAFwAWABUAFAASABAADgALAAgABgADAAAA/v/7//j/9f/z//H/7//t/+v/6v/q/+n/6f/p/+r/6//t/+7/8P/z//X/+P/6//3/AAACAAUACAAKAA0ADwARABMAFAAVABYAFgAWABYAFQAUABMAEQAPAA0ACwAIAAYAAwAAAP7/+//5//b/9P/x//D/7v/s/+v/6//q/+r/6v/r/+z/7f/v//H/8//1//j/+v/9/wAAAgAEAAcACgAMAA4AEAASABMAFAAVABUAFQAVABQAFAASABEADwANAAsACAAGAAMAAAD///z/+f/3//X/8v/w/+//7f/s/+z/6//r/+v/7P/t/+7/8P/x//P/9v/4//r//f8AAAEABAAGAAkACwANAA8AEQASABMAFAAUABQAFAAUABMAEgAQAA4ADAAKAAgABgADAAEA///8//r/+P/1//P/8f/w/+7/7f/t/+z/7P/s/+3/7v/v//D/8v/0//b/+P/6//3///8BAAMABgAIAAoADAAOABAAEQASABMAEwATABMAEwASABEAEAAOAAwACgAIAAYAAwABAP///f/6//j/9v/0//L/8f/v/+7/7v/t/+3/7f/u/+7/7//x//L/9P/2//j/+v/9////AQADAAUACAAKAAwADQAPABAAEQASABIAEwASABIAEQAQAA8ADgAMAAoACAAGAAMAAQAAAP3/+//5//f/9f/z//L/8P/v/+7/7v/u/+7/7v/v//D/8f/z//T/9v/4//r//f///wAAAwAFAAcACQALAA0ADgAPABAAEQASABIAEgARABEAEAAOAA0ACwAKAAgABgADAAEAAAD+//v/+f/3//b/9P/y//H/8P/v/+//7//v/+//8P/x//L/8//1//b/+P/6//3///8AAAIABAAGAAgACgAMAA0ADgAPABAAEQARABEAEQAQAA8ADgANAAsACQAIAAYAAwABAAAA/v/8//r/+P/2//X/8//y//H/8P/w/+//8P/w//D/8f/y//T/9f/3//n/+v/9////AAACAAQABgAIAAkACwAMAA4ADwAPABAAEAAQABAADwAOAA0ADAALAAkABwAFAAQAAQAAAP7//P/6//n/9//1//T/8//y//H/8P/w//D/8f/x//L/8//0//X/9//5//v//P/+/wAAAQADAAUABwAJAAoADAANAA4ADwAPAA8ADwAPAA8ADgANAAwACgAJAAcABQAEAAIAAAD///3/+//5//f/9v/1//P/8v/y//H/8f/x//H/8v/y//P/9P/2//f/+f/7//z//v8AAAEAAwAFAAcACAAKAAsADAANAA4ADgAPAA8ADgAOAA0ADAALAAoACQAHAAUABAACAAAA///9//v/+v/4//f/9f/0//P/8v/y//L/8v/y//L/8//0//X/9v/3//n/+//8//7/AAABAAMABAAGAAgACQAKAAwADAANAA4ADgAOAA4ADQANAAwACwAKAAgABwAFAAQAAgAAAP///f/8//r/+f/3//b/9f/0//P/8//y//L/8v/z//P/9P/1//b/+P/5//v//P/+/wAAAQACAAQABgAHAAkACgALAAwADQANAA0ADQANAA0ADAAMAAsACQAIAAcABQAEAAIAAAAAAP7//P/7//n/+P/2//X/9f/0//P/8//z//P/8//0//X/9v/3//j/+f/7//z//v8AAAAAAgAEAAUABwAIAAkACgALAAwADAANAA0ADQAMAAwACwAKAAkACAAHAAUABAACAAAAAAD+//3/+//6//j/9//2//X/9P/0//T/9P/0//T/9P/1//b/9//4//n/+//8//7/AAAAAAIAAwAFAAYACAAJAAoACwALAAwADAAMAAwADAALAAsACgAJAAgABgAFAAQAAgABAAAA/v/9//v/+v/5//j/9//2//X/9f/0//T/9P/0//X/9v/2//f/+P/6//v//P/+////AAABAAMABAAGAAcACAAJAAoACwALAAsADAAMAAsACwAKAAkACQAHAAYABQAEAAIAAQAAAP///f/8//r/+f/4//f/9v/2//X/9f/1//X/9f/1//b/9//4//n/+v/7//z//v///wAAAQADAAQABQAHAAgACQAJAAoACwALAAsACwALAAoACgAJAAgABwAGAAUABAACAAEAAAD///3//P/7//r/+f/4//f/9v/2//X/9f/1//X/9v/2//f/+P/5//r/+//8//7///8AAAEAAgAEAAUABgAHAAgACQAKAAoACgALAAsACgAKAAkACQAIAAcABgAFAAQAAgABAAAA///+//z/+//6//n/+P/3//f/9v/2//b/9v/2//b/9//3//j/+f/6//v//f/+////AAABAAIAAwAFAAYABwAIAAgACQAKAAoACgAKAAoACgAJAAgACAAHAAYABQADAAIAAQAAAP///v/9//z/+//5//n/+P/3//f/9v/2//b/9v/3//f/+P/4//n/+v/7//3//v///wAAAQACAAMABAAFAAYABwAIAAkACQAJAAoACgAJAAkACQAIAAcABwAGAAUAAwACAAEAAAAAAP7//f/8//v/+v/5//j/+P/3//f/9//3//f/9//3//j/+f/6//r//P/9//7///8AAAAAAgADAAQABQAGAAcABwAIAAkACQAJAAkACQAJAAgACAAHAAYABQAEAAMAAgABAAAAAAD///3//P/7//r/+f/5//j/+P/3//f/9//3//f/+P/4//n/+v/7//z//f/+////AAAAAAEAAgAEAAUABgAGAAcACAAIAAgACQAJAAkACAAIAAgABwAGAAUABAADAAIAAQAAAAAA///+//3//P/7//r/+f/5//j/+P/4//f/+P/4//j/+f/5//r/+//8//3//v///wAAAAABAAIAAwAEAAUABgAHAAcACAAIAAgACAAIAAgACAAHAAcABgAFAAQAAwACAAEAAAAAAP///v/9//z/+//6//r/+f/5//j/+P/4//j/+P/4//n/+v/6//v//P/9//7///8AAAAAAQACAAMABAAFAAYABgAHAAcACAAIAAgACAAIAAcABwAGAAYABQAEAAMAAgABAAAAAAD///7//f/8//v/+//6//n/+f/5//j/+P/4//j/+f/5//r/+v/7//z//f/+////AAAAAAEAAgADAAQABAAFAAYABgAHAAcABwAIAAgABwAHAAcABgAGAAUABAADAAIAAQAAAAAA///+//3//f/8//v/+v/6//n/+f/5//n/+f/5//n/+f/6//v/+//8//3//v///wAAAAABAAIAAgADAAQABQAGAAYABwAHAAcABwAHAAcABwAGAAYABQAFAAQAAwACAAEAAAAAAP/////+//3//P/7//v/+v/6//n/+f/5//n/+f/5//r/+v/7//v//P/9//7///8AAAAAAAABAAIAAwAEAAUABQAGAAYABwAHAAcABwAHAAYABgAGAAUABAAEAAMAAgABAAAAAAAAAP///v/9//z//P/7//r/+v/6//n/+f/5//n/+v/6//r/+//8//z//f/+////AAAAAAAAAQACAAMABAAEAAUABQAGAAYABgAHAAcABgAGAAYABQAFAAQABAADAAIAAQAAAAAAAAD///7//f/9//z/+//7//r/+v/6//r/+v/6//r/+v/7//v//P/8//3//v//////AAAAAAEAAgADAAMABAAFAAUABgAGAAYABgAGAAYABgAGAAUABQAEAAQAAwACAAEAAQAAAAAA///+//3//f/8//z/+//7//r/+v/6//r/+v/6//r/+//7//z//P/9//7//////wAAAAABAAIAAgADAAQABAAFAAUABgAGAAYABgAGAAYABQAFAAUABAADAAMAAgABAAEAAAAAAP///v/+//3//P/8//v/+//7//r/+v/6//r/+v/7//v//P/8//3//f/+//////8AAAAAAQABAAIAAwADAAQABQAFAAUABQAGAAYABgAFAAUABQAEAAQAAwADAAIAAQABAAAAAAD//////v/9//3//P/8//v/+//7//v/+//7//v/+//7//z//P/9//3//v//////AAAAAAEAAQACAAMAAwAEAAQABQAFAAUABQAFAAUABQAFAAUABAAEAAMAAwACAAEAAQAAAAAA//////7//f/9//z//P/8//v/+//7//v/+//7//v/+//8//z//f/9//7//////wAAAAAAAAEAAgACAAMABAAEAAQABQAFAAUABQAFAAUABQAEAAQABAADAAMAAgABAAEAAAAAAAAA///+//7//f/9//z//P/7//v/+//7//v/+//7//z//P/8//3//f/+//////8AAAAAAAABAAIAAgADAAMABAAEAAQABQAFAAUABQAFAAUABAAEAAQAAwADAAIAAQABAAAAAAAAAP///v/+//3//f/8//z//P/7//v/+//7//v//P/8//z//f/9//7//v//////AAAAAAAAAQABAAIAAwADAAQABAAEAAQABQAFAAUABAAEAAQABAADAAMAAgACAAEAAQAAAAAAAAD//////v/+//3//f/8//z//P/8//z//P/8//z//P/8//3//f/+//7//////wAAAAAAAAEAAQACAAIAAwADAAQABAAEAAQABAAEAAQABAAEAAQAAwADAAIAAgABAAEAAAAAAAAA//////7//v/9//3//P/8//z//P/8//z//P/8//z//P/9//3//v/+//////8AAAAAAAABAAEAAgACAAMAAwADAAQABAAEAAQABAAEAAQABAADAAMAAwACAAIAAQABAAAAAAAAAP/////+//7//f/9//3//P/8//z//P/8//z//P/8//3//f/9//7//v//////AAAAAAAAAQABAAIAAgACAAMAAwADAAQABAAEAAQABAAEAAQAAwADAAMAAgACAAEAAQAAAAAAAAAAAP/////+//7//f/9//3//P/8//z//P/8//z//f/9//3//f/+//7//////wAAAAAAAAAAAQABAAIAAgADAAMAAwADAAQABAAEAAQABAADAAMAAwADAAIAAgABAAEAAAAAAAAAAAD//////v/+//3//f/9//3//P/8//z//P/8//3//f/9//7//v/+//////8AAAAAAAAAAAEAAQACAAIAAgADAAMAAwADAAQABAAEAAMAAwADAAMAAgACAAIAAQABAAAAAAAAAAAA//////7//v/+//3//f/9//3//f/9//3//f/9//3//f/+//7//v//////AAAAAAAAAAABAAEAAgACAAIAAwADAAMAAwADAAMAAwADAAMAAwADAAIAAgACAAEAAQAAAAAAAAAAAP/////+//7//v/9//3//f/9//3//f/9//3//f/9//3//v/+//7//////wAAAAAAAAAAAQABAAEAAgACAAIAAwADAAMAAwADAAMAAwADAAMAAwACAAIAAgABAAEAAAAAAAAAAAD////////+//7//v/9//3//f/9//3//f/9//3//f/+//7//v/+//////8AAAAAAAAAAAAAAQABAAIAAgACAAMAAwADAAMAAwADAAMAAwADAAIAAgACAAIAAQABAAAAAAAAAAAAAAD//////v/+//7//v/9//3//f/9//3//f/9//3//v/+//7/////////AAAAAAAAAAAAAAEAAQACAAIAAgACAAMAAwADAAMAAwADAAMAAwACAAIAAgABAAEAAQAAAAAAAAAAAAAA/////////v/+//7//f/9//3//f/9//3//f/+//7//v/+/////////wAAAAA=';

        let navTapAudio = null;

        function playNavTapSound() {
            if (!appSettings.sound) return;
            try {
                if (!navTapAudio) navTapAudio = new Audio(NAV_TAP_SOUND_DATA);
                navTapAudio.currentTime = 0;
                const playResult = navTapAudio.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {});
                }
            } catch (e) {}
        }

        function triggerNavigationFeedback() {
            playNavTapSound();
            if (appSettings.haptic) triggerHaptic();
        }

        function requestBrowserNotifications() {
            if (!appSettings.orderUpdates || typeof Notification === 'undefined') return;
            try {
                if (Notification.permission === 'default') {
                    Notification.requestPermission().catch(function () {});
                }
            } catch (e) {}
        }

        function sendOrderNotification(title, body) {
            if (!appSettings.orderUpdates) return;
            try {
                if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    new Notification(title, { body: body, icon: FALLBACK_IMAGE });
                }
            } catch (e) {}
            if (appSettings.sound) playNavTapSound();
            if (appSettings.haptic) triggerHaptic();
            if (appSettings.emailNotifications) {
                showToast('Order update saved for email notifications');
            }
        }

        document.addEventListener('click', function (event) {
            const nav = event.target.closest('.nav-mob-btn, .nav-desk-btn, .dash-side-btn');
            if (nav) triggerNavigationFeedback();
        });

        // --- Profile Information ---
        function openProfileModal() {
            document.getElementById('profile-first-name').value = profile.firstName || '';
            document.getElementById('profile-last-name').value = profile.lastName || '';
            document.getElementById('profile-email').value = profile.email || '';
            document.getElementById('profile-phone').value = profile.phone || '';
            document.getElementById('profile-form-error').classList.add('hidden');
            openModal('modal-profile');
        }

        function saveProfileForm() {
            const firstName = document.getElementById('profile-first-name').value.trim();
            const lastName = document.getElementById('profile-last-name').value.trim();
            const email = document.getElementById('profile-email').value.trim();
            const phone = document.getElementById('profile-phone').value.trim();
            const errorEl = document.getElementById('profile-form-error');

            if (!firstName || !lastName) {
                errorEl.innerText = 'First and last name are required.';
                errorEl.classList.remove('hidden');
                return;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errorEl.innerText = 'Enter a valid email address.';
                errorEl.classList.remove('hidden');
                return;
            }
            errorEl.classList.add('hidden');

            profile = { firstName: firstName, lastName: lastName, email: email, phone: phone };
            persistProfile();
            renderAccountScreen();
            closeModal('modal-profile');
            showToast('Profile updated');
        }

        // --- Addresses ---
        function renderAddressesList() {
            const list = document.getElementById('addresses-list');
            const empty = document.getElementById('addresses-empty');
            if (addresses.length === 0) {
                list.innerHTML = '';
                empty.classList.remove('hidden');
                return;
            }
            empty.classList.add('hidden');
            list.innerHTML = addresses.map(function (addr) {
                return `
                    <div class="border border-gray-100 rounded-2xl p-4 relative">
                        <div class="flex justify-between items-start gap-3">
                            <div class="min-w-0">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <span class="font-bold text-sm md:text-base">${escapeHtml(addr.label || 'Address')}</span>
                                    ${addr.isDefault ? '<span class="bg-luxe-dark text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>' : ''}
                                </div>
                                <p class="text-sm text-gray-600">${escapeHtml(addr.fullName)} &middot; ${escapeHtml(addr.phone)}</p>
                                <p class="text-sm text-gray-500">${escapeHtml(addr.street)}, ${escapeHtml(addr.city)}, ${escapeHtml(addr.state)}</p>
                            </div>
                            <div class="flex flex-col gap-2 flex-shrink-0">
                                <button onclick="openAddressForm('${addr.id}')" aria-label="Edit address" class="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"><i class="fas fa-pen text-xs"></i></button>
                                <button onclick="deleteAddress('${addr.id}')" aria-label="Delete address" class="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-500 transition"><i class="fas fa-trash text-xs"></i></button>
                            </div>
                        </div>
                        ${!addr.isDefault ? `<button onclick="setDefaultAddress('${addr.id}')" class="mt-3 text-xs font-semibold text-luxe-dark hover:underline">Set as default</button>` : ''}
                    </div>
                `;
            }).join('');
        }

        function openAddressesModal() {
            renderAddressesList();
            openModal('modal-addresses');
        }

        function openAddressForm(addressId) {
            editingAddressId = addressId || null;
            const heading = document.getElementById('address-form-heading');
            document.getElementById('address-form-error').classList.add('hidden');
            if (editingAddressId) {
                const addr = addresses.find(function (a) { return a.id === editingAddressId; });
                if (!addr) return;
                heading.innerText = 'Edit Address';
                document.getElementById('addr-form-id').value = addr.id;
                document.getElementById('addr-label').value = addr.label || '';
                document.getElementById('addr-fullname').value = addr.fullName || '';
                document.getElementById('addr-phone').value = addr.phone || '';
                document.getElementById('addr-street').value = addr.street || '';
                document.getElementById('addr-city').value = addr.city || '';
                document.getElementById('addr-state').value = addr.state || 'Lagos';
                document.getElementById('addr-default').checked = !!addr.isDefault;
            } else {
                heading.innerText = 'Add Address';
                document.getElementById('addr-form-id').value = '';
                ['addr-label', 'addr-fullname', 'addr-phone', 'addr-street', 'addr-city'].forEach(function (id) {
                    document.getElementById(id).value = '';
                });
                document.getElementById('addr-state').value = 'Lagos';
                document.getElementById('addr-default').checked = addresses.length === 0;
            }
            closeModal('modal-addresses');
            openModal('modal-address-form');
        }

        function closeAddressForm() {
            closeModal('modal-address-form');
            openAddressesModal();
        }

        function saveAddressForm() {
            const label = document.getElementById('addr-label').value.trim() || 'Address';
            const fullName = document.getElementById('addr-fullname').value.trim();
            const phone = document.getElementById('addr-phone').value.trim();
            const street = document.getElementById('addr-street').value.trim();
            const city = document.getElementById('addr-city').value.trim();
            const state = document.getElementById('addr-state').value;
            const isDefault = document.getElementById('addr-default').checked;
            const errorEl = document.getElementById('address-form-error');

            if (!fullName || !phone || !street || !city) {
                errorEl.innerText = 'Please fill in all required fields.';
                errorEl.classList.remove('hidden');
                return;
            }
            errorEl.classList.add('hidden');

            const id = document.getElementById('addr-form-id').value;
            if (isDefault) addresses.forEach(function (a) { a.isDefault = false; });

            if (id) {
                const addr = addresses.find(function (a) { return a.id === id; });
                if (addr) Object.assign(addr, { label: label, fullName: fullName, phone: phone, street: street, city: city, state: state, isDefault: isDefault });
            } else {
                addresses.push({ id: 'addr-' + Date.now(), label: label, fullName: fullName, phone: phone, street: street, city: city, state: state, isDefault: isDefault || addresses.length === 0 });
            }
            persistAddresses();
            closeModal('modal-address-form');
            openAddressesModal();
            showToast('Address saved');
        }

        function deleteAddress(addressId) {
            const target = addresses.find(function (a) { return a.id === addressId; });
            const wasDefault = target ? target.isDefault : false;
            addresses = addresses.filter(function (a) { return a.id !== addressId; });
            if (wasDefault && addresses.length > 0) addresses[0].isDefault = true;
            persistAddresses();
            renderAddressesList();
            showToast('Address removed');
        }

        function setDefaultAddress(addressId) {
            addresses.forEach(function (a) { a.isDefault = (a.id === addressId); });
            persistAddresses();
            renderAddressesList();
        }

        // --- Change Password (validates + confirms locally) ---
        function openChangePasswordModal() {
            ['pwd-current', 'pwd-new', 'pwd-confirm'].forEach(function (id) { document.getElementById(id).value = ''; });
            document.getElementById('pwd-form-error').classList.add('hidden');
            openModal('modal-change-password');
        }

        function savePasswordForm() {
            const current = document.getElementById('pwd-current').value;
            const next = document.getElementById('pwd-new').value;
            const confirmVal = document.getElementById('pwd-confirm').value;
            const errorEl = document.getElementById('pwd-form-error');

            if (!current || !next || !confirmVal) {
                errorEl.innerText = 'Please fill in all three fields.';
                errorEl.classList.remove('hidden');
                return;
            }
            if (next.length < 8) {
                errorEl.innerText = 'New password must be at least 8 characters.';
                errorEl.classList.remove('hidden');
                return;
            }
            if (next !== confirmVal) {
                errorEl.innerText = 'New password and confirmation do not match.';
                errorEl.classList.remove('hidden');
                return;
            }
            errorEl.classList.add('hidden');
            closeModal('modal-change-password');
            showToast('Password updated');
        }

        // --- About Us / FAQ / Terms / Refund & Returns / Delivery Policy ---
        // 'about' and 'refund' are built dynamically in openInfoModal() instead
        // of living here, since both surface live Admin Settings (support
        // contact, return window) rather than fixed copy.
        const INFO_CONTENT = {
            terms: {
                title: 'Terms & Conditions',
                html: `
                    <p><strong>1. Orders.</strong> Placing an order is an offer to purchase; we confirm availability before an order is final.</p>
                    <p><strong>2. Pricing.</strong> All prices are shown in Naira (₦) and include applicable taxes unless stated otherwise.</p>
                    <p><strong>3. Accounts.</strong> You're responsible for keeping your account details accurate and your login information secure.</p>
                    <p><strong>4. Acceptable use.</strong> The storefront may not be used for any unlawful purpose or to interfere with other shoppers' use of the site.</p>
                    <p class="text-xs text-gray-400 pt-2 border-t border-gray-100">LuxeScents informational content — not a legal document.</p>
                `
            },
            delivery: {
                title: 'Order & Delivery Policy',
                html: `
                    <p><strong>Processing.</strong> Orders are prepared for delivery within 1–2 business days of confirmation.</p>
                    <p><strong>Delivery zones.</strong> We currently deliver to Lagos, Abuja and Kano, with more zones planned.</p>
                    <p><strong>Delivery times.</strong> Most orders arrive within 2–5 business days of dispatch, depending on your zone.</p>
                    <p><strong>Tracking.</strong> You can follow your order's status anytime from Account → Order History.</p>
                    <p class="text-xs text-gray-400 pt-2 border-t border-gray-100">LuxeScents informational content.</p>
                `
            }
        };

        const FAQ_ITEMS = [
            { q: "Are LuxeScents fragrances authentic?", a: "Yes — every product listed is sourced as a genuine, authentic release from its original house." },
            { q: "How long does delivery take?", a: "Most orders arrive within 2–5 business days after dispatch, depending on your delivery zone." },
            { q: "Can I change my order after checkout?", a: "Reach out as soon as possible with your order number — we can usually adjust an order before it ships." },
            { q: "What if an item arrives damaged?", a: "Contact us within 48 hours of delivery with a photo of the item and we'll sort out a replacement or refund." },
            { q: "Do you ship outside Lagos, Abuja and Kano?", a: "Not yet — those are our three active delivery zones for now, with more planned." }
        ];

        function openInfoModal(key) {
            const body = document.getElementById('info-modal-body');
            const heading = document.getElementById('info-modal-heading');

            if (key === 'faq') {
                heading.innerText = 'FAQ';
                body.innerHTML = FAQ_ITEMS.map(function (item, idx) {
                    return `
                        <div class="border border-gray-100 rounded-xl overflow-hidden">
                            <button onclick="toggleFAQ(${idx})" class="w-full flex justify-between items-center gap-3 p-4 text-left hover:bg-gray-50 transition">
                                <span class="font-semibold text-sm md:text-base text-luxe-dark">${escapeHtml(item.q)}</span>
                                <i class="fas fa-chevron-down text-xs text-gray-400 transition-transform flex-shrink-0" id="faq-icon-${idx}"></i>
                            </button>
                            <div class="hidden px-4 pb-4 text-sm text-gray-600 leading-relaxed" id="faq-answer-${idx}">${escapeHtml(item.a)}</div>
                        </div>
                    `;
                }).join('');
            } else if (key === 'about') {
                heading.innerText = 'About Us';
                body.innerHTML = `
                    <p>LuxeScents brings a curated edit of luxury and niche fragrances to Nigeria — from iconic Western houses to bold, long-lasting Arabic ouds.</p>
                    <p>Every bottle in our catalog is chosen for how it wears, not just how it's packaged, shipped straight from our Lagos warehouse to your door.</p>
                    <p>Questions? Reach us at <a href="mailto:${escapeHtml(adminSettings.supportEmail)}" class="text-luxe-dark font-semibold hover:underline">${escapeHtml(adminSettings.supportEmail)}</a> or <a href="tel:${escapeHtml(adminSettings.supportPhone)}" class="text-luxe-dark font-semibold hover:underline">${escapeHtml(adminSettings.supportPhone)}</a>.</p>
                    <p class="text-xs text-gray-400 pt-2 border-t border-gray-100">Product data, orders and preferences shown here are stored only in this browser.</p>
                `;
            } else if (key === 'refund') {
                heading.innerText = 'Refund & Returns';
                const days = adminSettings.returnWindowDays || 7;
                body.innerHTML = `
                    <p>If something isn't right with your order, we want to make it right.</p>
                    <p><strong>Eligibility.</strong> Unopened, unused items can be returned within ${days} day${days === 1 ? '' : 's'} of delivery.</p>
                    <p><strong>How it works.</strong> Reach out from your Order History with the order number, or contact us at <a href="mailto:${escapeHtml(adminSettings.supportEmail)}" class="text-luxe-dark font-semibold hover:underline">${escapeHtml(adminSettings.supportEmail)}</a> — once approved, we'll arrange a pickup or drop-off point.</p>
                    <p><strong>Refunds.</strong> Approved refunds are issued to your original payment method, typically within 5–7 business days.</p>
                    <p class="text-xs text-gray-400 pt-2 border-t border-gray-100">LuxeScents informational content.</p>
                `;
            } else {
                const entry = INFO_CONTENT[key];
                heading.innerText = entry ? entry.title : '';
                body.innerHTML = entry ? entry.html : '';
            }
            openModal('modal-info');
        }

        function toggleFAQ(idx) {
            const answer = document.getElementById('faq-answer-' + idx);
            const icon = document.getElementById('faq-icon-' + idx);
            if (!answer) return;
            const isOpen = !answer.classList.contains('hidden');
            answer.classList.toggle('hidden', isOpen);
            if (icon) icon.classList.toggle('rotate-180', !isOpen);
        }

        // --- Sign Out ---
        function openSignOutConfirm() {
            openModal('modal-signout-confirm');
        }

        function confirmSignOut() {
            closeModal('modal-signout-confirm');
            showToast('Signed out');
            navigateTo('view-home');
        }

        // --- Order History (full list; taps into Order Tracking for one order) ---
        function renderOrderHistory() {
            const list = document.getElementById('order-history-list');
            const empty = document.getElementById('order-history-empty');
            if (orders.length === 0) {
                list.innerHTML = '';
                list.classList.add('hidden');
                empty.classList.remove('hidden');
                empty.classList.add('flex');
                return;
            }
            list.classList.remove('hidden');
            empty.classList.add('hidden');
            empty.classList.remove('flex');

            list.innerHTML = orders.map(function (order) {
                const count = order.items.reduce(function (sum, it) { return sum + it.quantity; }, 0);
                return `
                    <button onclick="navigateTo('view-order-tracking', '${order.id}')" class="w-full text-left bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition flex items-center justify-between gap-4">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="font-bold text-sm md:text-base">#${escapeHtml(order.number)}</span>
                                <span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">${escapeHtml(order.status)}</span>
                            </div>
                            <p class="text-xs md:text-sm text-gray-500">${new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &middot; ${count} item${count === 1 ? '' : 's'}</p>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <span class="font-bold block text-sm md:text-base">${formatMoney(order.total)}</span>
                            <i class="fas fa-chevron-right text-gray-300 text-xs mt-1"></i>
                        </div>
                    </button>
                `;
            }).join('');
        }

        // =====================================================================
        // PROMOTIONS / CAMPAIGN
