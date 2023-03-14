const nickName = document.getElementById('nickname');
const coloredNick = document.getElementById('coloredNick');
const savedColors = [getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor()];
const presets = {
    1: {
        colors: ["FF0000", "FF7F00", "FFFF00", "00FF00", "0000FF", "4B0082", "9400D3"],
    }
}
const formats = {
    0: {
        outputPrefix: '',
        template: '&#$1$2$3$4$5$6$f$c',
        formatChar: '&',
        maxLength: 256
    },
    1: {
        outputPrefix: '',
        template: '<#$1$2$3$4$5$6>$f$c',
        formatChar: '&',
        maxLength: 256
    },
    2: {
        outputPrefix: '',
        template: '&x&$1&$2&$3&$4&$5&$6$f$c',
        formatChar: '&',
        maxLength: 256
    },
    3: {
        outputPrefix: '/nick ',
        template: '&#$1$2$3$4$5$6$f$c',
        formatChar: '&',
        maxLength: 256
    },
    4: {
        outputPrefix: '/nick ',
        template: '<#$1$2$3$4$5$6>$f$c',
        formatChar: '&',
        maxLength: 256
    },
    5: {
        outputPrefix: '/nick ',
        template: '&x&$1&$2&$3&$4&$5&$6$f$c',
        formatChar: '&',
        maxLength: 256
    },
    6: {
        outputPrefix: '',
        template: '§x§$1§$2§$3§$4§$5§$6$f$c',
        formatChar: '§',
        maxLength: null
    },
    7: {
        outputPrefix: '',
        template: '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
        formatChar: null,
        maxLength: null
    },
    8: {
        outputPrefix: '',
        template: '\\u00A7x\\u00A7$1\\u00A7$2\\u00A7$3\\u00A7$4\\u00A7$5\\u00A7$6$c',
        formatChar: null,
        maxLength: null
    },
    9: {
        outputPrefix: '',
        template: '{#$1$2$3$4$5$6$f$c}',
        formatChar: '&',
        maxLength: 256
    }
};

let numOfColours = 2;

function getRandomHexColor() {
    return Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
}

function showError(show) {
    if (show) {
        document.getElementById('error').style.display = 'block';
        document.getElementById('outputText').style.marginBottom = '5px';
    } else {
        document.getElementById('error').style.display = 'none';
        document.getElementById('outputText').style.marginBottom = '10px';
    }
}

function hex(c) {
    let s = '0123456789abcdef';
    let i = parseInt(c);
    if (i == 0 || isNaN(c))
        return '00';
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

/* Convert an RGB triplet to a hex string */
function convertToHex(rgb) {
    return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

/* Remove '#' in color hex string */
function trim(s) {
    return (s.charAt(0) == '#') ? s.substring(1, 7) : s
}

/* Convert a hex string to an RGB triplet */
function convertToRGB(hex) {
    let color = [];
    color[0] = parseInt((trim(hex)).substring(0, 2), 16);
    color[1] = parseInt((trim(hex)).substring(2, 4), 16);
    color[2] = parseInt((trim(hex)).substring(4, 6), 16);
    return color;
}

class Gradient {
    constructor(colors, numSteps) {
        this.colors = colors;
        this.gradients = [];
        this.steps = numSteps - 1;
        this.step = 0;

        const increment = this.steps / (colors.length - 1);
        for (let i = 0; i < colors.length - 1; i++)
            this.gradients.push(new TwoStopGradient(colors[i], colors[i + 1], increment * i, increment * (i + 1)));
    }

    next() {
        if (this.steps <= 1)
            return this.colors[0];

        const adjustedStep = Math.round(Math.abs(((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) / Math.PI) * this.steps));
        let color;
        if (this.gradients.length < 2) {
            color = this.gradients[0].colorAt(adjustedStep);
        } else {
            const segment = this.steps / this.gradients.length;
            const index = Math.min(Math.floor(adjustedStep / segment), this.gradients.length - 1);
            color = this.gradients[index].colorAt(adjustedStep);
        }

        this.step++;
        return color;
    }
}

class TwoStopGradient {
    constructor(startColor, endColor, lowerRange, upperRange) {
        this.startColor = startColor;
        this.endColor = endColor;
        this.lowerRange = lowerRange;
        this.upperRange = upperRange;
    }

    colorAt(step) {
        return [
            this.calculateHexPiece(step, this.startColor[0], this.endColor[0]),
            this.calculateHexPiece(step, this.startColor[1], this.endColor[1]),
            this.calculateHexPiece(step, this.startColor[2], this.endColor[2])
        ];
    }

    calculateHexPiece(step, channelStart, channelEnd) {
        const range = this.upperRange - this.lowerRange;
        const interval = (channelEnd - channelStart) / range;
        return Math.round(interval * (step - this.lowerRange) + channelStart);
    }
}

function addNumColours() {
    numOfColours++;
    if(numOfColours > 5) {
        numOfColours = 5;
    }

    toggleColors(numOfColours);
    updateOutputText(event);
}

function removeNumColours() {
    numOfColours--;
    if(numOfColours < 2) {
        numOfColours = 2;
    }

    toggleColors(numOfColours);
    updateOutputText(event);
}

function toggleColors(colors) {
    let clamped = Math.min(5, Math.max(2, colors));
    if (colors == 1 || colors == '') {
        colors = getColors().length;
    } else if (colors != clamped) {
        numOfColours = clamped;
        colors = clamped;
    }
    const container = $('#hexColors');
    const hexColors = container.find('.hexColor');
    const number = hexColors.size();
    if (number > colors) {
        hexColors.each((index, element) => {
            if (index + 1 > colors) {
                savedColors[index] = $(element).val();
                $(element).parent().remove();
            }
        });
    } else if (number < colors) {
        let template = $('#hexColorTemplate').html();
        for (let i = number + 1; i <= colors; i++) {
            let html = template.replaceAll(/\$NUM/g, i).replaceAll(/\$VAL/g, savedColors[i - 1]);
            container.append(html);
        }
        jscolor.install();
    }
}

function getColors() {
    const hexColors = $('#hexColors').find('.hexColor');
    const colors = [];
    hexColors.each((index, element) => {
        const value = $(element).val();
        savedColors[index] = value;
        colors[index] = convertToRGB(value);
    });
    return colors;
}

function randomColours() {
    const hexColors = $('#hexColors').find('.hexColor');
    hexColors.each((index, element) => {
        const value = getRandomHexColor();
        savedColors[index] = value;
        element.jscolor.fromString(value);
    });

    updateOutputText();
}

function randomColor(id) {
    const value = getRandomHexColor();

    savedColors[id - 1] = value;
    $('#hexColors').find(`#color-${id}`)[0].jscolor.fromString(value);

    updateOutputText();
}

function updateOutputText(event) {
    let format = formats[9];
    if (format.outputPrefix) {
        nickName.value = nickName.value.replace(/ /g, '');
        if (nickName.value) {
            let letters = /^[0-9a-zA-Z_]+$/;
            if (!nickName.value.match(letters)) nickName.value = nickName.value.replace(event.data, '');
            if (!nickName.value.match(letters)) nickName.value = 'superiornetworks.org';
        }
    }

    let newNick = nickName.value
    if (!newNick) {
        newNick = 'Type something!'
    }

    const bold = document.getElementById('bold').checked;
    const italic = document.getElementById('italics').checked;
    const underline = document.getElementById('underline').checked;
    const strike = document.getElementById('strike').checked;

    let outputText = document.getElementById('outputText');
    let gradient = new Gradient(getColors(), newNick.replace(/ /g, '').length);
    let charColors = [];
    let output = format.outputPrefix;
    for (let i = 0; i < newNick.length; i++) {
        let char = newNick.charAt(i);
        if (char == ' ') {
            output += char;
            charColors.push(null);
            continue;
        }

        let hex = convertToHex(gradient.next());
        charColors.push(hex);
        let hexOutput = format.template;
        for (let n = 1; n <= 6; n++)
            hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
        let formatCodes = '';
        if (format.formatChar != null) {
            if (bold) formatCodes += format.formatChar + 'l';
            if (italic) formatCodes += format.formatChar + 'o';
            if (underline) formatCodes += format.formatChar + 'n';
            if (strike) formatCodes += format.formatChar + 'm';
        }
        hexOutput = hexOutput.replace('$f', formatCodes);
        hexOutput = hexOutput.replace('$c', char);
        output += hexOutput;
    }

    outputText.innerText = output;
    showError(format.maxLength != null && format.maxLength < output.length);
    displayColoredName(newNick, charColors);
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function displayColoredName(nickName, colors) {
    coloredNick.classList.remove('minecraftbold', 'minecraftibold', 'minecraftitalic');
    if (document.getElementById('bold').checked) {
        if (document.getElementById('italics').checked) {
            coloredNick.classList.add('minecraftibold');
        } else {
            coloredNick.classList.add('minecraftbold');
        }
    } else if (document.getElementById('italics').checked) {
        coloredNick.classList.add('minecraftitalic');
    }
    coloredNick.innerHTML = '';
    for (let i = 0; i < nickName.length; i++) {
        const coloredNickSpan = document.createElement('span');
        if (document.getElementById('underline').checked) {
            if (document.getElementById('strike').checked) {
                coloredNickSpan.classList.add('minecraftustrike');
            } else coloredNickSpan.classList.add('minecraftunderline');
        } else if (document.getElementById('strike').checked) {
            coloredNickSpan.classList.add('minecraftstrike');
        }
        coloredNickSpan.style.color = `#${colors[i]}`;
        coloredNickSpan.textContent = nickName[i];
        coloredNick.append(coloredNickSpan);
    }
}

function preset(n) {
    const colors = presets[n].colors
    const container = $('#hexColors');
    container.empty();
    let template = $('#hexColorTemplate').html();
    for (let i = 0 + 1; i <= colors.length; i++) {
        let html = template.replaceAll(/\$NUM/g, i).replaceAll(/\$VAL/g, colors[i - 1]);
        container.append(html);
    }
    jscolor.install();
}

toggleColors(2);
updateOutputText();

function selectText(containerid) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
}

document.getElementById('output').addEventListener('click', () => {
    selectText('outputText');
});