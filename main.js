let jsPsych = initJsPsych({
    exclusions: {
        min_width : MIN_WIDTH,
        min_height : MIN_HEIGHT
    },
    extensions: [ {type: jsPsychExtensionMouseTracking} ]
});

// export jsPsych globally because this is a module now...
// or export jsPsych and import it from the other files.
window.jsPsych = jsPsych

const KEY_CODE_SPACE = ' ';
const G_QUESTION_CHOICES = [FALSE_BUTTON_TEXT, TRUE_BUTTON_TEXT];

let welcome_screen = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : WELCOME_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let browser_data = {
    type: jsPsychCallFunction,
    func: () => uil.browser.getResolutionInfo(),
};

let instruction_screen_practice = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : PRE_PRACTICE_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let present_text = {
    type : MouseReading,
    choices: ['next'],
    stimulus : jsPsych.timelineVariable('stimulus'),
    font: TRIAL_FONT_FAMILY,
    fontSize: TRIAL_FONT_SIZE,
    lineHeight: TRIAL_FONT_SIZE * 10,
    width: MIN_WIDTH * 0.8,
    minDurationMs: TRIAL_MIN_DURATION,
    mouseWindowWidth: MOUSE_WINDOW_WIDTH,
    mouseWindowHeight: MOUSE_WINDOW_HEIGHT,
    data : {
        id : jsPsych.timelineVariable('id'),
        item_type : jsPsych.timelineVariable('item_type'),
        uil_save : true
    },
    extensions: [
        {type: jsPsychExtensionMouseTracking}
    ],
}

let question = {
    type : jsPsychHtmlButtonResponse,
    stimulus : jsPsych.timelineVariable('question'),
    choices : G_QUESTION_CHOICES,
    data : {
        id : jsPsych.timelineVariable('id'),
        item_type : ()  => 'Q' + jsPsych.timelineVariable('item_type'),
        expected_answer : jsPsych.timelineVariable('qanswer'),
        uil_save : true
    },
    on_finish: function (data) {
        let choice = G_QUESTION_CHOICES[data.response];
        data.answer = choice;
        data.correct = choice === data.expected_answer;
        data.integer_correct = data.correct ? 1 : 0;
        data.rt = Math.round(data.rt);
    }
};

let maybe_question = {
    timeline: [ question ],
    conditional_function: function() {
        let q = jsPsych.timelineVariable('question');
        return typeof(q) !== 'undefined' && q.length > 0;
    }
};

let end_practice_screen = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : PRE_TEST_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let feedback_screen = {
    type: jsPsychSurveyText,
    preamble: FEEDBACK_PREAMBLE,
    questions: [
	{prompt: FEEDBACK_PROMPT, rows: 5},
    ]
};

let end_experiment = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : SAVING_DATA,
    choices : [],
    on_load: async function() {
        await uil.saveData();
        jsPsych.endExperiment(POST_TEST_INSTRUCTION);
    }
}

let enter_fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: true
}

/**
 * Randomize a table of stimuli
 */
function randomizeStimuli(table) {
    let shuffled = uil.randomization.randomizeStimuli(
        table,
        MAX_SUCCEEDING_ITEMS_OF_TYPE
    );

    if (shuffled !== null)
        table = shuffled;
    else {
        console.error('Unable to shuffle stimuli according to the set constraints.');
        let msg = "Unable to shuffle the stimuli, perhaps loosen the " +
                  "constraints, or check the item_types on the stimuli.";
        throw new SprRandomizationError(msg);
    }

    return table; // shuffled table if possible original otherwise
}

/**
 * Get the timeline for a table of stimuli
 */
function getTimeline(table) {
    //////////////// timeline /////////////////////////////////
    let timeline = [];

    // Welcome the participant and guide them through the
    // consent forms and survey.
    timeline.push(welcome_screen);

    // collect screen resolution
    timeline.push(browser_data);

    // Obtain informed consent.
    timeline.push(consent_procedure);
    consent_given = true;

    timeline.push(enter_fullscreen);

    // add survey
    timeline.push(survey_procedure);

    // Add the different parts of the experiment to the timeline
    timeline.push(instruction_screen_practice);

    let practice = {
        timeline: [
            present_text,
            maybe_question
        ],
        timeline_variables: PRACTICE_ITEMS
    };

    timeline.push(practice);
    timeline.push(end_practice_screen);

    if (PSEUDO_RANDOMIZE) {
        table = randomizeStimuli(table);
    }

    let test = {
        timeline: [
            present_text,
            maybe_question
        ],
        timeline_variables: table
    }

    timeline.push(test);
    timeline.push(feedback_screen);
    timeline.push(end_experiment);
    return timeline;
}


function main() {
    // Make sure you have updated your key in globals.js
    uil.setAccessKey(ACCESS_KEY);
    uil.stopIfExperimentClosed();

    // Option 1: client side randomization:
    let stimuli = pickRandomList();
    kickOffExperiment(getTimeline(stimuli.table), stimuli.list_name);

    // Option 2: server side balancing:
    // Make sure you have matched your groups on the dataserver with the
    // lists in stimuli.js..
    // This experiment uses groups/lists list1, and list2 by default (see
    // stimuli.js).
    // Hence, unless you change lists here, you should created matching
    // groups there.
    // uil.session.start(ACCESS_KEY, (group_name) => {
    //     let stimuli = findList(group_name);
    //     kickOffExperiment(getTimeline(stimuli.table), stimuli.list_name);
    // });
}



// this function will eventually run the jsPsych timeline
function kickOffExperiment(timeline, list_name) {

    let subject_id = uil.session.isActive() ?
        uil.session.subjectId() : jsPsych.randomization.randomID(8);

    // data one would like to add to __all__ trials, according to:
    // https://www.jspsych.org/overview/data/
    jsPsych.data.addProperties (
        {
            subject : subject_id,
            list : list_name,
        }
    );

    // Start jsPsych when running on a Desktop or Laptop style pc.
    uil.browser.rejectMobileOrTablet();
    jsPsych.run(timeline);
}

/**
 * This function will pick a random list from the TEST_ITEMS array.
 *
 * Returns an object with a list and a table, the list will always indicate
 * which list has been chosen for the participant.
 *
 * @returns {object} object with list_name and table fields
 */
function pickRandomList() {
    let range = function (n) {
        let empty_array = [];
        let i;
        for (i = 0; i < n; i++) {
            empty_array.push(i);
        }
        return empty_array;
    }
    let num_lists = TEST_ITEMS.length;
    var shuffled_range = jsPsych.randomization.repeat(range(num_lists), 1)
    var retlist = TEST_ITEMS[shuffled_range[0]];
    return retlist
}

function findList(name) {
    let list = TEST_ITEMS.find((entry) => entry.list_name === name);
    if (!list) {
        let found = TEST_ITEMS.map((entry) => `"${entry.list_name}"`).join(', ');
        console.error(
            `List not found "${name}".\n` +
                'This name was configured on the UiL datastore server.\n' +
                `The following lists exist in stimuli.js: \n${found}`)
    }
    return list;
}

// start the experiment
window.addEventListener('load', main);
