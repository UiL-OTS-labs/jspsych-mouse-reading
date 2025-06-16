// Item types
const PASSIVE   = "PASSIVE";
const ACTIVE    = "ACTIVE";
const FILLER    = "FILLER";
const PRAC      = "PRAC";

// experimental, filler and practice items from:
// Caterina Laura Paolazzi, Nino Grillo, Artemis Alexiadou & Andrea Santi (2019)
// Passives are not hard to interpret but hard to remember: evidence from
// online and offline studies, Language, Cognition and Neuroscience,
// 34:8, 991-1015, DOI: 10.1080/23273798.2019.1602733.
// Questions made up by Iris Mulders.

// Lists if you use server side balancing make sure they match the lists
// in the target groups, this is case sensitive.
const LISTS = [
    "list1",
];

const PRACTICE_ITEMS = [
    {
        id : 1,
        item_type : PRAC,
        stimulus :
        "The teacher took the car instead of the express train due to the previously announced public transport strike.",
        question : "",                                            // An empty string means no question for this trial.
        qanswer : undefined                                       // We can't define a answer if there ain't no question.
    },
    {
        id : 2,
        item_type : PRAC,
        stimulus :
            `The researcher presented his most recent work
            to the commission and obtained very positive
            comments regarding the experimental design`,
        question : "The researcher presented old work.",
        qanswer : FALSE_BUTTON_TEXT                               // Use TRUE_BUTTON_TEXT if the answer is true,
                                                                  // FALSE_BUTTON_TEXT otherwise
    }
];

const LIST_GROUP1 = [
    {
        id : 1,
        item_type : PASSIVE,
        stimulus :
            `The guitarist was rejected by the attractive and
            talented singer in the concert hall next to
            the Irish pub.`,
        question : "The singer was attractive.",
        qanswer : TRUE_BUTTON_TEXT
    },
    {
        id : 2,
        item_type : ACTIVE,
        stimulus :
            `The sculptor mugged the strange and
            temperamental photographer in the art gallery
            next to the book shop.`,
        question : "",
        qanswer : undefined
    },
];

const TEST_ITEMS = [
    {list_name: LISTS[0], table: LIST_GROUP1},
];
