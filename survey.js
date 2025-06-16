
// global repeat boolean
// If the survey is filled out incorrectly the questionaire
// is repeated.
let repeat_survey = false;

// 1th survey question


const survey_1 = {
    type: IlsSurveyPlugin,
    fields: {
        birth_year: {label: 'Birth year'},
        birth_month: {label: 'Month'},
        native_language: {label: 'Native language'},
    },
    html: `
    <h4>Please answer some questions</h4>
    <div style="text-align: left">
	<p>In what year were you born?</p>
	<div>
            <input type="number" name="birth_year" required>
	</div>
	<p>In what month were you born?</p>
	<div>
            <input type="number" name="birth_month" required>
	</div>
	<p>What is your native language?</p>
	<div>
            <input type="text" name="native_language" required>
	</div>
    </div>
    <div style="margin: 20px">
        <button class="jspsych-btn">Continue</button>
    </div>
    `,
    exclusion: function(data) {
        // return true when participant should be excluded

        let currentYear = (new Date()).getFullYear();
        let age = currentYear - parseInt(data.birth_year, 10);

        // reject participants younger than 18
        if (age < 18) {
            return true;
        }

        // reject participants older than 80
        if (age > 80) {
            return true;
        }

        // accept participant otherwise
        return false
    },
};

// 2nd survey question

const survey_2 = {
    type: IlsSurveyPlugin,
    fields: {
        mouse_type: {
            label: 'Mouse type',
            options: {
                mouse: "Mouse",
                trackpad: "Trackpad",
                other: "Other"}
        }
    },
    exclusion: function(data) {
        // return true when participant should be excluded
        if (data.dyslexia == 'yes') {
            return true;
        }
        // accept participant otherwise
        return false
    },
    html: `
    <div style="text-align: left">
    <p>Will you complete the experiment using a laptop trackpad, a regular mouse, or other?
        <span class="info-toggle"></span>
    <span class="info">
    We ask this because the study involves tracking mouse movements.
    </span>
    </p>
    <div>
        <label><input type="radio" name="mouse_type" value="mouse" required/>Regular mouse</label>
        <label><input type="radio" name="mouse_type" value="trackpad" required/>Trackpad</label>
        <label><input type="radio" name="mouse_type" value="other" required/>Other</label>
    </div>
    </div>
    <div style="margin: 20px">
        <button class="jspsych-btn">Continue</button>
    </div>
    `
};

let survey_procedure = {
    timeline : [
        survey_1,
        survey_2,
    ]
};
