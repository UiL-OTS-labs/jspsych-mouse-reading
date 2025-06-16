
class MouseReading {

    static info = {
        name: "mouse-reading",
        parameters: {
            stimulus: {
                type: jsPsychModule.ParameterType.HTML_STRING,
                default: undefined
            },
            font: {
                type: jsPsychModule.ParameterType.STRING,
                default: 'Arial'
            },
            fontSize: {
                type: jsPsychModule.ParameterType.INTEGER,
                default: 18
            },
            lineHeight: {
                type: jsPsychModule.ParameterType.INTEGER,
                default: 40
            },
            width: {
                type: jsPsychModule.ParameterType.INTEGER,
                default: 0
            },
            minDurationMs: {
                type: jsPsychModule.ParameterType.INTEGER,
                default: 1000
            },
            mouseWindowWidth: {
                type: jsPsychModule.ParameterType.INTEGER,
                default: 50
            },
            mouseWindowHeight: {
                type: jsPsychModule.ParameterType.INTEGER,
                default: 50
            },
            mouseOffsetX: {
                type: jsPsychModule.ParameterType.INTEGER,
                default: 12
            },
            mouseOffsetY: {
                type: jsPsychModule.ParameterType.INTEGER,
                default: -6
            }
        }
    }

    constructor(jsPsych) {
        this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
        let words = trial.stimulus.split(/\s+/);

        let mouseEvents = [];
        let start = performance.now();
        let visible = false;

        let spans = Object.entries(words).map(([idx, word]) => {
            let span = document.createElement('span');
            span.classList.add('reading-word');
            span.addEventListener('mouseenter', () => mouseEvents.push({type: 'enter', idx: idx, word: word, t: performance.now() - start}));
            span.addEventListener('mouseleave', () => mouseEvents.push({type: 'leave', idx: idx, word: word, t: performance.now() - start}));
            span.innerText = word;
            return span;
        });

        display_element.innerHTML =
            `<div class="reading-text-fixation">+</div>
             <div class="reading-text-lower"></div>
             <div class="reading-text-upper">${trial.stimulus}</div>
            <div class="continue"><button class="jspsych-btn">Continue</button></div>`;


        let fixation = display_element.querySelector('.reading-text-fixation');
        let upper = display_element.querySelector('.reading-text-upper');
        let lower = display_element.querySelector('.reading-text-lower');

        fixation.addEventListener('mouseenter', () => {
            setTimeout(() => {
                fixation.style.display = 'none';
            }, 200);

            setTimeout(() => {
                upper.style.visibility = 'visible';
                lower.style.visibility = 'visible';
                visible = true;
            }, 1000);
        });

        for(let span of spans) {
            lower.append(span);
            lower.append(' ');
        }


        this.win = document.createElement('div');
        this.win.classList.add('window');
        this.win.style.width = `${trial.mouseWindowWidth}px`;
        this.win.style.height = `${trial.mouseWindowHeight}px`;

        let handler = (event) => this.mouseMove(event, trial.mouseOffsetX, trial.mouseOffsetY);
        document.addEventListener('mousemove', handler);
        display_element.append(this.win);

        lower.addEventListener('mouseenter', () => { this.win.style.display = 'block' });
        lower.addEventListener('mouseleave', () => { this.win.style.display = 'none' });

        fixation.style.fontFamily = trial.font;
        fixation.style.fontSize = `${trial.fontSize * 2}px`;
        fixation.style.lineHeight = `${trial.lineHeight}px`;
        fixation.style.transform = `translate(${-trial.width/2}px)`;

        upper.style.fontFamily = trial.font;
        upper.style.fontSize = `${trial.fontSize}px`;
        upper.style.lineHeight = `${trial.lineHeight}px`;
        upper.style.width = `${trial.width}px`;
        lower.style.fontFamily = trial.font;
        lower.style.fontSize = `${trial.fontSize}px`;
        lower.style.lineHeight = `${trial.lineHeight}px`;
        lower.style.width = `${trial.width}px`;


        // collect bounding rect for every word in the stimulus
        let rects = Object.entries(display_element.querySelectorAll('span.reading-word')).map(([idx, span]) => {
            return {idx: parseInt(idx, 10), word: span.innerText, rect: span.getBoundingClientRect()};
        });

        display_element.querySelector('.continue button').addEventListener('click', () => {
            if (performance.now() - start < trial.minDurationMs) {
                return;
            }
            if (!visible) {
                return;
            }
            this.jsPsych.finishTrial({rects: rects, mouseEvents: mouseEvents});
        });
    }

    mouseMove(event, offsetX, offsetY) {
        this.win.style.left = `${event.x + offsetX}px`;
        this.win.style.top = `${event.y + offsetY}px`;
    }
}
