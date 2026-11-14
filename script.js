const CYRILLIC_MAP = {
    'a': '\u0430', 'b': '\u042c', 'c': '\u0441', 'e': '\u0435', 'h': '\u043d', 'i': '\u0456', 'j': '\u0458',
    'k': '\u043a', 'm': '\u043c', 'n': '\u043f', 'o': '\u043e', 'p': '\u0440', 's': '\u0455', 't': '\u0442',
    'u': '\u0446', 'x': '\u0445', 'y': '\u0443', 'z': '\u1d22',
    'A': '\u0410', 'B': '\u0412', 'C': '\u0421', 'E': '\u0415', 'H': '\u041d', 'I': '\u0406', 'J': '\u0408',
    'K': '\u041a', 'M': '\u041c', 'N': '\u041f', 'O': '\u041e', 'P': '\u0420', 'S': '\u0405', 'T': '\u0422',
    'U': '\u0426', 'X': '\u0425', 'Y': '\u0423', 'Z': '\u0396'
};

const UNICODE_MAP = {
    'a': '\u{1d586}', 'e': '\u{1d58a}', 'i': '\u{1d58e}', 'o': '\u{1d594}', 'u': '\u{1d59a}', 's': '\u{1d598}',
    'A': '\u{1d56c}', 'E': '\u{1d570}', 'I': '\u{1d574}', 'O': '\u{1d57a}', 'U': '\u{1d580}', 'S': '\u{1d57e}'
};

function transformText(input, method) {
    switch (method) {
        case 'unicode':
            return input.split('').map(char => UNICODE_MAP[char] || char).join('');
        case 'emoji':
            return input.split('').join('\u25aa\ufe0f');
        case 'dot':
            return input.split('').join('.');
        case 'rot13':
            return input.replace(/[a-zA-Z]/g, (char) => {
                const upperBound = char <= 'Z' ? 90 : 122;
                const shifted = char.charCodeAt(0) + 13;
                return String.fromCharCode(shifted <= upperBound ? shifted : shifted - 26);
            });
        case 'reverse':
            return input.split('').reverse().join('');
        case 'cyrillic':
            return input.split('').map(char => CYRILLIC_MAP[char] || char).join('');
        case 'strikethrough':
            return input.split('').join('\u0336');
        case 'base64':
            try {
                return btoa(input);
            } catch (e) {
                return 'Error: Invalid character for Base64 encoding.';
            }
        case 'combo':
            return input.split('').map(char => (CYRILLIC_MAP[char] || char) + '\u2060').join('');
        case 'invisible':
        default:
            return input.split('').join('\u2060');
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const inputBox = document.getElementById('inputBox');
        const bypassSelect = document.getElementById('bypassSelect');
        const outputText = document.getElementById('outputText');
        const copyButton = document.getElementById('copyButton');
        const copyButtonText = copyButton.querySelector('span');
        const currentYear = document.getElementById('current-year');

        if (currentYear) {
            currentYear.textContent = new Date().getFullYear();
        }

        function updateOutput() {
            outputText.textContent = transformText(inputBox.value, bypassSelect.value);
        }

        function fallbackCopy(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'absolute';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            let ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (err) {
                console.error('Fallback copy failed', err);
                ok = false;
            }
            document.body.removeChild(textArea);
            return ok;
        }

        async function copyToClipboard() {
            const textToCopy = outputText.textContent;
            if (!textToCopy || copyButton.classList.contains('copied')) return;

            const showFeedback = (success = true) => {
                if (success) {
                    copyButtonText.textContent = 'Copied!';
                    copyButton.classList.add('copied');
                } else {
                    copyButtonText.textContent = 'Error!';
                }

                setTimeout(() => {
                    copyButtonText.textContent = 'Copy Result';
                    copyButton.classList.remove('copied');
                }, 2000);
            };

            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    showFeedback(true);
                    return;
                } catch (err) {
                    showFeedback(fallbackCopy(textToCopy));
                    return;
                }
            }

            showFeedback(fallbackCopy(textToCopy));
        }

        inputBox.addEventListener('input', updateOutput);
        bypassSelect.addEventListener('change', updateOutput);
        copyButton.addEventListener('click', copyToClipboard);

        updateOutput();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { transformText, CYRILLIC_MAP, UNICODE_MAP };
}
