
// IMPORTANT
// Access key, this must be modified.
// You will get this id when you have requested an experiment on
// the data storage server.
// If you do not fill out a valid key, the participant's
// browser will not be able to upload the data to the server.
// Replace this by a PERFECT COPY of the key from the data server.
const ACCESS_KEY = '00000000-0000-0000-0000-000000000000';

//RANDOMIZATION

// Whether or not to pseudorandomize the test items
const PSEUDO_RANDOMIZE = true;
// The maximum number of items with a similar itemtype in a row
const MAX_SUCCEEDING_ITEMS_OF_TYPE = 2

// This defines the dimensions of the canvas on which
// the sentences are drawn. Keep in mind, that you'll exclude
// participants with a low screen resolution when you set this too
// high.
const MIN_WIDTH = 1000;
const MIN_HEIGHT = 600;

// The ISI will be added after each trial/stimulus
const ISI = 500; //ms

// Fragments of text to display on buttons
const YES_BUTTON_TEST = "yes"
const NO_BUTTON_TEST = "no"
const OK_BUTTON_TEXT = "ok";
const TRUE_BUTTON_TEXT = "true";
const FALSE_BUTTON_TEXT = "false";
const CONTINUE_BUTTON_TEXT = "continue";

// The duration in ms for how long the finished instruction
// is on screen.
const FINISH_TEXT_DUR = 3000;


const TRIAL_FONT_FAMILY = 'Courier New';
const TRIAL_FONT_SIZE = 18;
const TRIAL_LINE_HEIGHT = 40;
const TRIAL_MIN_DURATION = 3000;

const MOUSE_WINDOW_WIDTH = 102;
const MOUSE_WINDOW_HEIGHT = 38;
