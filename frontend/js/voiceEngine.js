// ==========================================
// CALCURA - COMMON VOICE ENGINE
// Used by Dashboard + Voice Input
// ==========================================

function chooseBestVoiceResult(results) {

    if (!results || !results.length) {
        return "";
    }

    const scientificWords = [
        "sin",
        "sine",
        "sign",
        "cos",
        "cosine",
        "tan",
        "tangent",
        "log",
        "ln",
        "square root",
        "cube root",
        "sqrt",
        "cbrt",
        "factorial",
        "squared",
        "cubed",
        "power",
        "plus",
        "minus",
        "times",
        "into",
        "divided",
        "combination",
        "permutation"
    ];

    for (const result of results) {

        const lower = result.toLowerCase();

        for (const word of scientificWords) {

            if (lower.includes(word)) {
                return result;
            }
        }
    }

    return results[0];
}


// ==========================================
// VOICE → MATHEMATICAL EXPRESSION
// ==========================================

function convertVoiceToMath(input) {

    let text = input.toLowerCase().trim();

    // Remove punctuation
    text = text.replace(/[?,!]/g, " ");

    // Pi
    text = text.replace(/[πΠ]/g, "pi");

    // Remove unnecessary dots
    text = text.replace(/\.(?!\d)/g, " ");

    // Clean spaces
    text = text.replace(/\s+/g, " ");


    // ==========================================
    // LOGARITHMS
    // ==========================================

    text = text.replace(/\bnatural logarithm\b/g, "ln");
    text = text.replace(/\bnatural log\b/g, "ln");

    text = text.replace(/\bcommon logarithm\b/g, "log");
    text = text.replace(/\bcommon log\b/g, "log");


    // ==========================================
    // TRIGONOMETRY
    // ==========================================

    text = text.replace(/\bsine\b/g, "sin");
    text = text.replace(/\bsign\b/g, "sin");

    text = text.replace(/\bcosine\b/g, "cos");

    text = text.replace(/\btangent\b/g, "tan");


    // ==========================================
    // TRIG SQUARE / CUBE
    // ==========================================

    text = text.replace(
        /\b(sin|cos|tan)\s+(?:square|squared)\s+of\s+(-?\d+(?:\.\d+)?)/g,
        "$1($2)^2"
    );

    text = text.replace(
        /\b(sin|cos|tan)\s+(?:cube|cubed)\s+of\s+(-?\d+(?:\.\d+)?)/g,
        "$1($2)^3"
    );


    // ==========================================
    // INVERSE TRIG
    // ==========================================

    text = text.replace(/\binverse\s+sin\b/g, "asin");
    text = text.replace(/\binverse\s+cos\b/g, "acos");
    text = text.replace(/\binverse\s+tan\b/g, "atan");

    text = text.replace(/\bsine inverse\b/g, "asin");
    text = text.replace(/\binverse sine\b/g, "asin");

    text = text.replace(/\bcosine inverse\b/g, "acos");
    text = text.replace(/\binverse cosine\b/g, "acos");

    text = text.replace(/\btangent inverse\b/g, "atan");
    text = text.replace(/\binverse tangent\b/g, "atan");


    // ==========================================
    // ROOTS
    // ==========================================

    text = text.replace(/\bsquare root of\b/g, "sqrt");
    text = text.replace(/\bsquare root\b/g, "sqrt");

    text = text.replace(/\bcube root of\b/g, "cbrt");
    text = text.replace(/\bcube root\b/g, "cbrt");


    // ==========================================
    // BRACKETS
    // ==========================================

    text = text.replace(
        /(\d+(?:\.\d+)?\s*(?:\+|\-|\*|\/)\s*\d+(?:\.\d+)?)\s+in\s+brackets?/g,
        "($1)"
    );

    text = text.replace(
        /(\d+(?:\.\d+)?\s*(?:\+|\-|\*|\/)\s*\d+(?:\.\d+)?)\s+in\s+the\s+brackets?/g,
        "($1)"
    );

    text = text.replace(/\bopen bracket\b/g, "(");
    text = text.replace(/\bopening bracket\b/g, "(");
    text = text.replace(/\bleft bracket\b/g, "(");

    text = text.replace(/\bclose bracket\b/g, ")");
    text = text.replace(/\bclosing bracket\b/g, ")");
    text = text.replace(/\bright bracket\b/g, ")");

    text = text.replace(/\bopen parenthesis\b/g, "(");
    text = text.replace(/\bclose parenthesis\b/g, ")");


    // ==========================================
    // REMOVE "OF"
    // ==========================================

    text = text.replace(
        /\b(sin|cos|tan|asin|acos|atan|log|ln)\s+of\b/g,
        "$1"
    );


    // ==========================================
    // OPERATORS
    // ==========================================

    text = text.replace(/\bmultiplied by\b/g, "*");
    text = text.replace(/\bmultiply by\b/g, "*");
    text = text.replace(/\btimes\b/g, "*");

    // IMPORTANT:
    // "into" means multiplication
    text = text.replace(/\binto\b/g, "*");

    text = text.replace(/\bdivided by\b/g, "/");
    text = text.replace(/\bdivide by\b/g, "/");
    text = text.replace(/\bover\b/g, "/");

    text = text.replace(/\bplus\b/g, "+");
    text = text.replace(/\badd\b/g, "+");

    text = text.replace(/\bminus\b/g, "-");
    text = text.replace(/\bsubtract\b/g, "-");


    // ==========================================
    // POWERS
    // ==========================================

    text = text.replace(
        /\b(sine|sin|cosine|cos|tangent|tan)\s+squared\s+of\b/g,
        "$1 of"
    );

    text = text.replace(
        /\b(sine|sin|cosine|cos|tangent|tan)\s+cubed\s+of\b/g,
        "$1 of"
    );

    text = text.replace(
        /\bto the power of\b/g,
        "^"
    );

    text = text.replace(
        /\bto the power\b/g,
        "^"
    );

    text = text.replace(
        /\bsquared\b/g,
        "^2"
    );

    text = text.replace(
        /\bcubed\b/g,
        "^3"
    );


    // ==========================================
    // FACTORIAL
    // ==========================================

    text = text.replace(
        /\bfactorial\b/g,
        "!"
    );


    // ==========================================
    // CONSTANTS
    // ==========================================

    text = text.replace(/\bpie\b/g, "pi");

    text = text.replace(/\beuler's number\b/g, "e");
    text = text.replace(/\beulers number\b/g, "e");


    // ==========================================
    // DECIMALS
    // ==========================================

    text = text.replace(/\bdecimal point\b/g, ".");
    text = text.replace(/\bdecimal\b/g, ".");


    // ==========================================
    // NUMBER WORDS
    // ==========================================

    text = convertNumberWords(text);


    // ==========================================
    // PERCENTAGE
    // ==========================================

    text = text.replace(
        /(\d+(?:\.\d+)?)\s*percent\s+of\s+(\d+(?:\.\d+)?)/g,
        "($1/100)*$2"
    );

    text = text.replace(
        /(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/g,
        "($1/100)*$2"
    );


    // ==========================================
    // PERCENTAGE INCREASE
    // ==========================================

    text = text.replace(
        /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*%/g,
        "$1+($1*$2/100)"
    );

    text = text.replace(
        /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*%/g,
        "$1-($1*$2/100)"
    );


    // ==========================================
    // COMBINATION
    // ==========================================

    text = text.replace(
        /(\d+(?:\.\d+)?)\s*(?:combination|choose)\s*(\d+(?:\.\d+)?)/g,
        "nCr($1,$2)"
    );


    // ==========================================
    // PERMUTATION
    // ==========================================

    text = text.replace(
        /(\d+(?:\.\d+)?)\s*(?:permutation|permutations)\s*(\d+(?:\.\d+)?)/g,
        "nPr($1,$2)"
    );


    // ==========================================
    // FUNCTION + NUMBER
    // ==========================================

    text = text.replace(
        /\b(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt)\s*(-?\d+(?:\.\d+)?)/g,
        "$1($2)"
    );


    // ==========================================
    // FUNCTION + PI
    // ==========================================

    text = text.replace(
        /\b(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt)\s+pi\b/g,
        "$1(pi)"
    );


    // Remove remaining spaces
    text = text.replace(/\s+/g, "");


    // Final function correction
    text = text.replace(
        /(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt)(-?\d+(?:\.\d+)?)/g,
        "$1($2)"
    );


    // ==========================================
    // AUTOMATIC MULTIPLICATION
    // ==========================================

    text = text.replace(
        /(\d)(pi|e|sqrt|cbrt|sin|cos|tan|asin|acos|atan|log|ln)/g,
        "$1*$2"
    );


    return text;
}


// ==========================================
// NUMBER WORDS
// ==========================================

function convertNumberWords(text) {

    const numbers = {

        zero: "0",
        one: "1",
        two: "2",
        three: "3",
        four: "4",
        five: "5",
        six: "6",
        seven: "7",
        eight: "8",
        nine: "9",
        ten: "10",

        eleven: "11",
        twelve: "12",
        thirteen: "13",
        fourteen: "14",
        fifteen: "15",
        sixteen: "16",
        seventeen: "17",
        eighteen: "18",
        nineteen: "19",

        twenty: "20",
        thirty: "30",
        forty: "40",
        fifty: "50",
        sixty: "60",
        seventy: "70",
        eighty: "80",
        ninety: "90"

    };


    const compoundNumbers = {

        "twenty one": "21",
        "twenty two": "22",
        "twenty three": "23",
        "twenty four": "24",
        "twenty five": "25",
        "twenty six": "26",
        "twenty seven": "27",
        "twenty eight": "28",
        "twenty nine": "29",

        "thirty one": "31",
        "thirty two": "32",
        "thirty three": "33",
        "thirty four": "34",
        "thirty five": "35",
        "thirty six": "36",
        "thirty seven": "37",
        "thirty eight": "38",
        "thirty nine": "39",

        "forty five": "45",
        "fifty five": "55",
        "sixty five": "65",
        "seventy five": "75",
        "eighty five": "85",
        "ninety five": "95"

    };


    for (const phrase in compoundNumbers) {

        text = text.replace(
            new RegExp("\\b" + phrase + "\\b", "g"),
            compoundNumbers[phrase]
        );

    }


    for (const word in numbers) {

        text = text.replace(
            new RegExp("\\b" + word + "\\b", "g"),
            numbers[word]
        );

    }


    return text;
}