
const WELCOME_INSTRUCTION =
    "<h1>Dear participant,</h1>"                                        +
    "<h2>"                                                              +
        "Welcome"                                                       +
    "</h2>"                                                             +
    "<p>"                                                               +
        "Press the spacebar to continue."                               +
    "</p>";

const PRE_PRACTICE_INSTRUCTION =
    "<h1>"                                                              +
        "Task instructions"                                             +
    "</h1>"                                                             +
    "<p>"                                                               +
    "In this experiment, you will be reading sentences and answering questions " +
    "about what you read.</p><p>" +
    "At first, the sentences will appear blurry. To read them, you have to move " +
    "your cursor (mouse pointer) over each word, revealing them for as long as " +
    "your cursor is nearby. When you have completely finished reading a sentence, " +
    "click the 'Continue' button to advance.</p><p>There will be a practice round " +
    "to help you get used to the experiment.</p><p>To start reading each sentence, " +
    "hold your cursor over the purple cross (+) sign." +
    "<br>" +
    "<p>"                                                               +
        "<i>Hit the spacebar when ready to start the practice.</i>"                  +
    "</p>";

const PRE_TEST_INSTRUCTION =
    "<p>"                                                               +
        "End of the practice part."                                     +
    "</p>"                                                              +
    "<p>"                                                               +
        "<i>Press the spacebar to continue.</i>"                        +
    "</p>";

const SAVING_DATA =
      `
<style>
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #000;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
    }
</style>
<div><span class="loader"></span></div>
<div><strong>Saving experiment data...</strong></div>
    `;

const POST_TEST_INSTRUCTION =
    "<h1>End of the experiment.</h1>"                                   +
    "<h2>Many thanks for participating</h2>";

const FINISHED_NO_CONSENT =
    "<h1>The experiment finished, because no consent was given</h1>"    +
    "<p>You can close this tab now.</p>";

const FEEDBACK_PREAMBLE = `
    <p>The experiment is now complete. <strong>Please do not close this window yet.</strong></p>
    `;

const FEEDBACK_PROMPT = `
    Do you have any further comments or feedback about the experiment? If not, please leave empty
    `;
