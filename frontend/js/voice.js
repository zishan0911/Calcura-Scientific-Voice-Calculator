// ==========================================
// CALCURA - SCIENTIFIC VOICE CALCULATOR
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");
const recognizedText = document.getElementById("recognizedText");
const mathExpression = document.getElementById("mathExpression");
const resultBox = document.getElementById("result");
const voiceLanguage = document.getElementById("voiceLanguage");
const saveVoiceBtn = document.getElementById("saveVoiceBtn");

let recognition = null;
let currentExpression = "";
let isListening = false;

// Voice waves
const voiceWaves = document.querySelectorAll(".voice-wave");

function setVoiceWaveState(active) {
    voiceWaves.forEach((wave) => {
        wave.style.setProperty(
            "display",
            active ? "flex" : "none",
            "important"
        );
    });
}

// Page open hone par waves hidden
setVoiceWaveState(false);

// ==========================================
// VOICE RECOGNITION
// ==========================================

if (!SpeechRecognition) {

    statusText.textContent =
        "Voice recognition is not supported in this browser.";

    micBtn.disabled = true;

} else {

    recognition = new SpeechRecognition();

recognition.lang = voiceLanguage
    ? voiceLanguage.value
    : "en-US";    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 10;

    voiceLanguage.addEventListener("change", () => {
    recognition.lang = voiceLanguage.value;
});


    recognition.onstart = () => {

        micBtn.classList.add("listening");

        statusText.textContent =
            "Listening... Speak your expression.";

    };


    recognition.onresult = (event) => {

        const alternatives = [];

        for (
            let i = 0;
            i < event.results[0].length;
            i++
        ) {
            alternatives.push(
                event.results[0][i].transcript
            );
        }

        console.log(
            "Voice alternatives:",
            alternatives
        );

        const bestText =
            chooseBestResult(alternatives);

        recognizedText.textContent =
            bestText;

        currentExpression =
            convertVoiceToMath(bestText);
            // ==========================================
// NUMERICAL METHOD DETECTION
// ==========================================

if (
    bestText.toLowerCase().includes("modified euler") ||
    bestText.toLowerCase().includes("modify euler") ||
    bestText.toLowerCase().includes("defied euler") ||
    bestText.toLowerCase().includes("defined euler") ||
    bestText.toLowerCase().includes("modified euler method") ||
    bestText.toLowerCase().includes("modify euler method")
) {

    try {

        const modifiedEulerData =
            parseModifiedEulerVoice(bestText);

        if (modifiedEulerData) {

            const modifiedEulerResult =
                solveModifiedEuler(modifiedEulerData);

            recognizedText.textContent =
                bestText;

           if (mathExpression) {
    mathExpression.textContent =
        `Modified Euler Method: dy/dx = ${modifiedEulerResult.derivative}`;
}

            resultBox.textContent =
                `y(${modifiedEulerResult.targetX}) = ${formatResult(modifiedEulerResult.result)}`;

                speakVoiceAnswer(
    `y ${modifiedEulerResult.targetX} equals ${formatResult(modifiedEulerResult.result)}`
);

            statusText.textContent =
                "Modified Euler Method calculation completed.";

            return;
        }

    } catch (error) {

        console.error(
            "Modified Euler Method Error:",
            error
        );

        resultBox.textContent =
            "Unable to calculate Modified Euler Method.";

        statusText.textContent =
            error.message;

        return;
    }
}

       if (mathExpression) {
    mathExpression.textContent =
        currentExpression || "Unable to understand";
}


        // AUTOMATIC CALCULATION
        if (currentExpression) {

            try {

                const answer =
                    calculateExpression(
                        currentExpression
                    );

                const formattedAnswer =
    formatResult(answer);

resultBox.textContent =
    formattedAnswer;

    speakVoiceAnswer(formattedAnswer);

saveVoiceCalculationToDatabase(
    currentExpression,
    formattedAnswer
);

                statusText.textContent =
                    "Calculation completed.";

            } catch (error) {

                console.error(
                    "Calculation error:",
                    error
                );

                resultBox.textContent =
                    "Unable to calculate expression.";

                statusText.textContent =
                    "Expression recognized, but calculation failed.";

            }
        }
    };


   recognition.onend = () => {

    micBtn.classList.remove("listening");

    isListening = false;

    setVoiceWaveState(false);

};


    recognition.onerror = (event) => {

        micBtn.classList.remove("listening");
        
        isListening = false;

        setVoiceWaveState(false);

        console.error(
            "Speech recognition error:",
            event.error
        );

        if (event.error === "no-speech") {

            statusText.textContent =
                "No speech detected. Please try again.";

        } else if (event.error === "not-allowed") {

            statusText.textContent =
                "Microphone permission was denied.";

        } else {

            statusText.textContent =
                "Voice recognition error.";

        }
    };


  micBtn.addEventListener("click", () => {

    // Mic ON hai → second click par OFF
    if (isListening) {

        try {
            recognition.stop();
        } catch (error) {
            console.log("Recognition stop error:", error);
        }

        isListening = false;

        micBtn.classList.remove("listening");

        setVoiceWaveState(false);

        statusText.textContent =
            "Click the microphone and speak";

        return;
    }


    // Mic OFF hai → first click par ON
    try {

        isListening = true;

        setVoiceWaveState(true);

        recognition.start();

    } catch (error) {

        console.log(
            "Recognition already running."
        );

    }

});
}


// ==========================================
// CHOOSE BEST VOICE RESULT
// ==========================================

function chooseBestResult(results) {

    if (!results.length) {
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
        "divided"
    ];

    for (const result of results) {

        const lower =
            result.toLowerCase();

        for (const word of scientificWords) {

            if (lower.includes(word)) {
                return result;
            }
        }
    }

    return results[0];
}


// ==========================================
// VOICE TO MATH
// ==========================================

function convertVoiceToMath(input) {

    let text = input.toLowerCase().trim();

    // --------------------------------
// HINDI VOICE COMMANDS
// --------------------------------
text = text
    .replace(/जोड़/g, "plus")
    .replace(/जमा/g, "plus")
    .replace(/प्लस/g, "plus")
    .replace(/घटाना/g, "minus")
    .replace(/माइनस/g, "minus")
    .replace(/गुणा/g, "times")
    .replace(/गुना/g, "times")
    .replace(/भाग/g, "divided by")
    .replace(/डिवाइड/g, "divided by");

text = text
    .replace(/शून्य/g, "zero")
    .replace(/एक/g, "one")
    .replace(/दो/g, "two")
    .replace(/तीन/g, "three")
    .replace(/चार/g, "four")
    .replace(/पांच/g, "five")
    .replace(/पाँच/g, "five")
    .replace(/छह/g, "six")
    .replace(/सात/g, "seven")
    .replace(/आठ/g, "eight")
    .replace(/नौ/g, "nine")
    .replace(/दस/g, "ten");

    // --------------------------------
    // 1. Remove unnecessary punctuation
    // --------------------------------
// --------------------------------
// 1. Remove unnecessary punctuation
// --------------------------------
text = text.replace(/[?,!]/g, " ");

// Convert Greek pi symbol to normal pi
text = text.replace(/[πΠ]/g, "pi");

text = text.replace(/\.(?!\d)/g, " ");
text = text.replace(/\s+/g, " ");

    // --------------------------------
    // 2. Natural / common logarithm
    // --------------------------------
    text = text.replace(/\bnatural logarithm\b/g, "ln");
    text = text.replace(/\bnatural log\b/g, "ln");
    text = text.replace(/\bcommon logarithm\b/g, "log");
    text = text.replace(/\bcommon log\b/g, "log");


    // --------------------------------
    // 3. Trigonometric functions
    // --------------------------------
    text = text.replace(/\bsine\b/g, "sin");
    text = text.replace(/\bsign\b/g, "sin");

    text = text.replace(/\bcosine\b/g, "cos");

    text = text.replace(/\btangent\b/g, "tan");
   
    // Reciprocal trigonometric functions

    text = text.replace(/\bcosecant\b/g, "csc");
    text = text.replace(/\bcosec\b/g, "csc");
    text = text.replace(/\bsecant\b/g, "sec");
    text = text.replace(/\bcotangent\b/g, "cot");

// --------------------------------
// Trigonometric square / cube
// --------------------------------

text = text.replace(
    /\b(sin|cos|tan)\s+(?:square|squared)\s+of\s+(-?\d+(?:\.\d+)?)/g,
    "$1($2)^2"
);

text = text.replace(
    /\b(sin|cos|tan)\s+(?:cube|cubed)\s+of\s+(-?\d+(?:\.\d+)?)/g,
    "$1($2)^3"
);
  // --------------------------------
// 4. Inverse trigonometric functions
// --------------------------------

// Inverse Sine
text = text.replace(/\binverse\s+sine\b/g, "asin");
text = text.replace(/\bsine\s+inverse\b/g, "asin");
text = text.replace(/\binverse\s+sin\b/g, "asin");

// Inverse Cosine
text = text.replace(/\binverse\s+cosine\b/g, "acos");
text = text.replace(/\bcosine\s+inverse\b/g, "acos");
text = text.replace(/\binverse\s+cos\b/g, "acos");

// Inverse Tangent
text = text.replace(/\binverse\s+tangent\b/g, "atan");
text = text.replace(/\btangent\s+inverse\b/g, "atan");
text = text.replace(/\binverse\s+tan\b/g, "atan");


    // --------------------------------
    // 5. Roots
    // --------------------------------
    text = text.replace(/\bsquare root of\b/g, "sqrt");
    text = text.replace(/\bsquare root\b/g, "sqrt");

    text = text.replace(/\bcube root of\b/g, "cbrt");
    text = text.replace(/\bcube root\b/g, "cbrt");


    // --------------------------------
    // 6. Brackets
    // --------------------------------
    // Expressions spoken as "in brackets"
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

    text = text.replace(/\bbracket\b/g, "(");


    // --------------------------------
    // 7. Remove "of" after functions
    // --------------------------------
    text = text.replace(
        /\b(sin|cos|tan|asin|acos|atan|log|ln)\s+of\b/g,
        "$1"
    );


    // --------------------------------
    // 8. Mathematical operators
    // --------------------------------
    text = text.replace(/\bmultiplied by\b/g, "*");
    text = text.replace(/\bmultiply by\b/g, "*");
    text = text.replace(/\btimes\b/g, "*");
    text = text.replace(/\binto\b/g, "*");

    text = text.replace(/\bdivided by\b/g, "/");
    text = text.replace(/\bdivide by\b/g, "/");
    text = text.replace(/\bover\b/g, "/");

    text = text.replace(/\bplus\b/g, "+");
    text = text.replace(/\badd\b/g, "+");

    text = text.replace(/\bminus\b/g, "-");
    text = text.replace(/\bsubtract\b/g, "-");


    // --------------------------------
    // 9. Powers
    // --------------------------------
    // Trigonometric squared/cubed
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


    // --------------------------------
    // 10. Factorial
    // --------------------------------
    text = text.replace(
        /\bfactorial\b/g,
        "!"
    );


    // --------------------------------
    // 11. Constants
    // --------------------------------
    text = text.replace(/\bpi\b/g, "pi");
    text = text.replace(/\bpie\b/g, "pi");

    text = text.replace(/\beuler's number\b/g, "e");
    text = text.replace(/\beulers number\b/g, "e");


    // --------------------------------
    // 12. Decimal words
    // --------------------------------
    text = text.replace(/\bdecimal point\b/g, ".");
    text = text.replace(/\bdecimal\b/g, ".");


    // --------------------------------
    // 13. Convert number words
    // --------------------------------
    text = convertNumberWords(text);
// --------------------------------
// Percentage of
// Example:
// 20 percent of 500
// → (20/100)*500
// --------------------------------

text = text.replace(
    /(\d+(?:\.\d+)?)\s*percent\s+of\s+(\d+(?:\.\d+)?)/g,
    "($1/100)*$2"
);

// Handle % symbol
text = text.replace(
    /(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/g,
    "($1/100)*$2"
);
// --------------------------------
// Percentage increase / decrease
// Examples:
// 500 + 10% → 500+(500*10/100)
// 500 - 10% → 500-(500*10/100)
// --------------------------------

text = text.replace(
    /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*%/g,
    "$1+($1*$2/100)"
);

text = text.replace(
    /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*%/g,
    "$1-($1*$2/100)"
);
// --------------------------------
// Permutation and Combination
// --------------------------------

// Five combination two
// → nCr(5,2)

text = text.replace(
    /(\d+(?:\.\d+)?)\s*(?:combination|choose)\s*(\d+(?:\.\d+)?)/g,
    "nCr($1,$2)"
);

// Five permutation two
// → nPr(5,2)

text = text.replace(
    /(\d+(?:\.\d+)?)\s*(?:permutation|permutations)\s*(\d+(?:\.\d+)?)/g,
    "nPr($1,$2)"
);

    // --------------------------------
    // 14. Function + number
    // Example:
    // sin 30 → sin(30)
    // sqrt 144 → sqrt(144)
    // log 100 → log(100)
    // --------------------------------
    text = text.replace(/\b(sin|cos|tan|sec|csc|cot|asin|acos|atan|log|ln|sqrt|cbrt)\s*(-?\d+(?:\.\d+)?)/g, "$1($2)");


    // --------------------------------
    // 15. Function + pi
    // Example:
    // sin pi → sin(pi)
    // --------------------------------
    text = text.replace(
        /\b(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt)\s+pi\b/g,
        "$1(pi)"
    );


    // --------------------------------
    // 16. Remove remaining spaces
    // --------------------------------
    text = text.replace(/\s+/g, "");


    // --------------------------------
    // 17. Final function correction
    // --------------------------------
    text = text.replace(
        /(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt)(-?\d+(?:\.\d+)?)/g,
        "$1($2)"
    );


    // --------------------------------
    // 18. Add multiplication:
    // 2pi → 2*pi
    // 2sqrt(25) → 2*sqrt(25)
    // --------------------------------
    text = text.replace(
        /(\d)(pi|e|sqrt|cbrt|sin|cos|tan|asin|acos|atan|log|ln)/g,
        "$1*$2"
    );


    // --------------------------------
    // 19. Return final expression
    // --------------------------------
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
            new RegExp(
                "\\b" + phrase + "\\b",
                "g"
            ),
            compoundNumbers[phrase]
        );
    }


    for (const word in numbers) {

        text = text.replace(
            new RegExp(
                "\\b" + word + "\\b",
                "g"
            ),
            numbers[word]
        );
    }


    return text;
}


// ==========================================
// SCIENTIFIC CALCULATOR
// ==========================================

function calculateExpression(expression) {

    let exp = expression.trim();

    // ==========================================
    // CONSTANTS
    // ==========================================

    exp = exp.replace(/\bpi\b/gi, "Math.PI");
    exp = exp.replace(/\be\b/g, "Math.E");


    // ==========================================
    // FACTORIAL
    // ==========================================

    exp = exp.replace(
        /(\d+(?:\.\d+)?)!/g,
        (match, number) => {
            return factorial(Number(number));
        }
    );
// ==========================================
// PERMUTATION AND COMBINATION
// ==========================================

exp = exp.replace(
    /nCr\((\d+),(\d+)\)/gi,
    (match, n, r) => {
        return combination(
            Number(n),
            Number(r)
        );
    }
);

exp = exp.replace(
    /nPr\((\d+),(\d+)\)/gi,
    (match, n, r) => {
        return permutation(
            Number(n),
            Number(r)
        );
    }
);

// ==========================================
// POWERS OF SCIENTIFIC FUNCTIONS
// ==========================================

// Example:
// tan(30)^2
// sin(45)^2
// sqrt(25)^2

exp = exp.replace(
    /\b(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt)\(([^()]*)\)\^(-?\d+(?:\.\d+)?)/gi,
    "Math.pow($1($2),$3)"
);


// ==========================================
// POWER OF BRACKET EXPRESSION
// ==========================================

// Example:
// (5+3)^2
// (10-2)^3

exp = exp.replace(
    /(\([^()]+\))\^(-?\d+(?:\.\d+)?)/g,
    "Math.pow($1,$2)"
);


// ==========================================
// NORMAL NUMBER POWER
// ==========================================

// Example:
// 2^5
// 10^3

exp = exp.replace(
    /(\d+(?:\.\d+)?)\^(-?\d+(?:\.\d+)?)/g,
    "Math.pow($1,$2)"
);


    // ==========================================
    // SCIENTIFIC FUNCTIONS
    // ==========================================
    
    exp = replaceScientificFunctions(exp);
// Secant
exp = exp.replace(/\bsec\(([^()]*)\)/gi, (match, value) => {
  const number = evaluateSimpleValue(value);
  const radians = number * Math.PI / 180;
  return `(1/Math.cos(${radians}))`;
});

// Cosecant
exp = exp.replace(/\bcsc\(([^()]*)\)/gi, (match, value) => {
  const number = evaluateSimpleValue(value);
  const radians = number * Math.PI / 180;
  return `(1/Math.sin(${radians}))`;
});

// Cotangent
exp = exp.replace(/\bcot\(([^()]*)\)/gi, (match, value) => {
  const number = evaluateSimpleValue(value);
  const radians = number * Math.PI / 180;
  return `(Math.cos(${radians})/Math.sin(${radians}))`;
});

    // ==========================================
    // SECURITY CHECK
    // ==========================================

    const safeExpression =
    /^(?:[0-9+\-*/().,\s]|Math\.(?:sin|cos|tan|asin|acos|atan|log10|log|sqrt|cbrt|abs|pow)|Math\.PI|Math\.E)+$/;

exp = exp.trim();

    if (!safeExpression.test(exp)) {

        console.error("Unsafe expression:", exp);

        throw new Error(
            "Invalid mathematical expression"
        );
    }


    // ==========================================
    // CALCULATE
    // ==========================================

    const answer = Function(
        `"use strict"; return (${exp})`
    )();


    // ==========================================
    // RESULT VALIDATION
    // ==========================================

    if (!Number.isFinite(answer)) {

        throw new Error(
            "Invalid result"
        );
    }


    return answer;
}


// ==========================================
// SCIENTIFIC FUNCTIONS
// ==========================================

function replaceScientificFunctions(expression) {

    let exp = expression;


    // ==========================================
    // INVERSE SIN
    // ==========================================

    exp = exp.replace(
        /\basin\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `(Math.asin(${number})*180/Math.PI)`;
        }
    );


    // ==========================================
    // INVERSE COS
    // ==========================================

    exp = exp.replace(
        /\bacos\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `(Math.acos(${number})*180/Math.PI)`;
        }
    );


    // ==========================================
    // INVERSE TAN
    // ==========================================

    exp = exp.replace(
        /\batan\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `(Math.atan(${number})*180/Math.PI)`;
        }
    );


    // ==========================================
    // SIN
    // ==========================================

    exp = exp.replace(
        /\bsin\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `Math.sin((${number})*Math.PI/180)`;
        }
    );


    // ==========================================
    // COS
    // ==========================================

    exp = exp.replace(
        /\bcos\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `Math.cos((${number})*Math.PI/180)`;
        }
    );


    // ==========================================
    // TAN
    // ==========================================

    exp = exp.replace(
        /\btan\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `Math.tan((${number})*Math.PI/180)`;
        }
    );


    // ==========================================
    // SQUARE ROOT
    // ==========================================

    exp = exp.replace(
        /\bsqrt\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `Math.sqrt(${number})`;
        }
    );


    // ==========================================
    // CUBE ROOT
    // ==========================================

    exp = exp.replace(
        /\bcbrt\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `Math.cbrt(${number})`;
        }
    );


    // ==========================================
    // LOG
    // ==========================================

    exp = exp.replace(
        /\blog\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `Math.log10(${number})`;
        }
    );


    // ==========================================
    // NATURAL LOG
    // ==========================================

    exp = exp.replace(
        /\bln\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `Math.log(${number})`;
        }
    );


    // ==========================================
    // ABSOLUTE VALUE
    // ==========================================

    exp = exp.replace(
        /\babs\(([^()]*)\)/gi,
        (match, value) => {

            const number = evaluateSimpleValue(value);

            return `Math.abs(${number})`;
        }
    );


    return exp;
}


// ==========================================
// SIMPLE VALUE
// ==========================================

function evaluateSimpleValue(value) {

    const cleaned =
        value
            .replace(
                /\bpi\b/gi,
                "Math.PI"
            )
            .replace(
                /\be\b/g,
                "Math.E"
            );

    return Function(
        `"use strict"; return (${cleaned})`
    )();
}


// ==========================================
// FACTORIAL
// ==========================================

function factorial(number) {

    if (
        number < 0 ||
        !Number.isInteger(number)
    ) {

        throw new Error(
            "Factorial requires a positive integer"
        );
    }


    if (number > 170) {

        throw new Error(
            "Number is too large"
        );
    }


    let answer = 1;


    for (
        let i = 2;
        i <= number;
        i++
    ) {

        answer *= i;

    }


    return answer;
}

function permutation(n, r) {

    if (
        !Number.isInteger(n) ||
        !Number.isInteger(r) ||
        n < 0 ||
        r < 0 ||
        r > n
    ) {
        throw new Error("Invalid permutation");
    }

    return factorial(n) / factorial(n - r);
}


function combination(n, r) {

    if (
        !Number.isInteger(n) ||
        !Number.isInteger(r) ||
        n < 0 ||
        r < 0 ||
        r > n
    ) {
        throw new Error("Invalid combination");
    }

    return factorial(n) /
        (factorial(r) * factorial(n - r));
}
// ==========================================
// FORMAT RESULT
// ==========================================

function formatResult(value) {

    if (
        Math.abs(value) < 0.0000000001
    ) {

        return "0";
    }


    return Number(
        value.toFixed(10)
    ).toString();
}

async function saveVoiceCalculationToDatabase(
    expression,
    result
) {
    try {
        const token =
            localStorage.getItem("calcuraToken");

        if (!token) {
            console.log(
                "User not logged in. Voice calculation not saved."
            );
            return;
        }

        const response = await fetch(
            "http://localhost:5000/api/calculations",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    "Authorization":
                        `Bearer ${token}`
                },
                body: JSON.stringify({
                    expression: expression,
                    result: String(result),
                    type: "voice"
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to save voice calculation"
            );
        }

        console.log(
            "Voice calculation saved to MongoDB:",
            data
        );

    } catch (error) {
        console.error(
            "Voice calculation save error:",
            error
        );
    }
}
function speakVoiceAnswer(result) {

        if (!voiceFeedbackEnabled) {
        return;
    }

    if (!("speechSynthesis" in window)) {
        console.log("Text-to-speech is not supported.");
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(
            `The answer is ${result}`
        );

    speech.lang = voiceLanguage
        ? voiceLanguage.value
        : "en-US";

    speech.rate = voiceSpeed;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}
async function saveVoiceCalculationToSaved(
    expression,
    result
) {
    try {
        const token =
            localStorage.getItem("calcuraToken");

        if (!token) {
            alert("Please login first to save calculations.");
            return;
        }

        const response = await fetch(
            "http://localhost:5000/api/saved",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    expression: expression,
                    result: String(result),
                    type: "voice"
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to save voice calculation"
            );
        }

        alert("Voice calculation saved successfully.");

        console.log(
            "Voice calculation saved:",
            data
        );

    } catch (error) {
        console.error(
            "Save voice calculation error:",
            error
        );

        alert(
            error.message ||
            "Failed to save calculation."
        );
    }
}
if (saveVoiceBtn) {
    saveVoiceBtn.addEventListener(
        "click",
        async function () {

            if (!currentExpression) {
                alert("Please speak an expression first.");
                return;
            }

            const result =
                resultBox.textContent;

            if (!result || result === "—" || result === "Error") {
                alert("Please calculate a valid expression first.");
                return;
            }

            await saveVoiceCalculationToSaved(
                currentExpression,
                result
            );

            const saveIcon =
    saveVoiceBtn.querySelector("i");

if (saveIcon) {
    saveIcon.classList.remove("fa-regular");
    saveIcon.classList.add("fa-solid");
}
        }
    );
}
// ==========================================
// SHOW LOGGED-IN USER NAME
// ==========================================

const profileName =
    document.getElementById("profileName");

const profileAvatar =
    document.getElementById("profileAvatar");

const savedUser =
    localStorage.getItem("calcuraUser");

if (savedUser) {

    const user =
        JSON.parse(savedUser);

    const userName =
        user.name ||
        user.fullName ||
        user.username ||
        "User";

    if (profileName) {
        profileName.textContent =
            userName;
    }

    if (profileAvatar) {
        profileAvatar.textContent =
            userName.charAt(0).toUpperCase();
    }
}
// ==========================================
// NOTIFICATION BUTTON
// ==========================================

const notificationButton =
    document.getElementById("notificationButton");

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        () => {

           const notificationButton =
    document.getElementById("notificationButton");

const notificationPanel =
    document.getElementById("notificationPanel");

if (notificationButton && notificationPanel) {

    notificationButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            const isOpen =
                notificationPanel.style.display === "block";

            notificationPanel.style.display =
                isOpen ? "none" : "block";

        }
    );


    document.addEventListener(
        "click",
        (event) => {

            if (
                !notificationPanel.contains(event.target) &&
                !notificationButton.contains(event.target)
            ) {

                notificationPanel.style.display =
                    "none";

            }

        }
    );

}

        }
    );

}
// ==========================================
// VOICE SETTINGS CONNECTION
// ==========================================

const voiceSpeedSlider =
    document.getElementById("voiceSpeed");
const voiceSpeedValue =
    document.getElementById("voiceSpeedValue");

const voiceFeedbackToggle =
    document.getElementById("voiceFeedback");

let voiceSpeed = 1;
let voiceFeedbackEnabled = true;


// VOICE SPEED
if (voiceSpeedSlider) {

    voiceSpeedSlider.addEventListener(
        "input",
        () => {

            voiceSpeed =
                Number(voiceSpeedSlider.value);

            if (voiceSpeedValue) {

                let speedText = "Normal";

                if (voiceSpeed < 0.8) {
                    speedText = "Slow";
                } else if (voiceSpeed > 1.2) {
                    speedText = "Fast";
                }

                voiceSpeedValue.textContent =
                    `${voiceSpeed.toFixed(1)}× ${speedText}`;
            }

        }
    );

}


// VOICE FEEDBACK
if (voiceFeedbackToggle) {

    voiceFeedbackToggle.addEventListener(
        "change",
        () => {

            voiceFeedbackEnabled =
                voiceFeedbackToggle.checked;

        }
    );

}
// ==========================================
// COPY VOICE RESULT
// ==========================================

const copyVoiceResult =
    document.getElementById("copyVoiceResult");

if (copyVoiceResult) {

    copyVoiceResult.addEventListener(
        "click",
        async function () {

            const result =
                resultBox.textContent.trim();

            if (
                !result ||
                result === "—"
            ) {
                alert(
                    "There is no result to copy."
                );
                return;
            }

            try {

                await navigator.clipboard.writeText(
                    result
                );

                const copyIcon =
                    copyVoiceResult.querySelector("i");

                if (copyIcon) {
                    copyIcon.classList.remove(
                        "fa-regular",
                        "fa-copy"
                    );

                    copyIcon.classList.add(
                        "fa-solid",
                        "fa-check"
                    );
                }

                setTimeout(() => {

                    if (copyIcon) {
                        copyIcon.classList.remove(
                            "fa-solid",
                            "fa-check"
                        );

                        copyIcon.classList.add(
                            "fa-regular",
                            "fa-copy"
                        );
                    }

                }, 1500);

            } catch (error) {

                console.error(
                    "Copy result error:",
                    error
                );

                alert(
                    "Could not copy the result."
                );
            }

        }
    );

}
const editRecognizedText =
    document.getElementById("editRecognizedText");
if (editRecognizedText && recognizedText) {

    editRecognizedText.addEventListener(
        "click",
        () => {
            recognizedText.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            const editedText =
                recognizedText.textContent.trim();

            if (!editedText) {
                return;
            }

            currentExpression =
                convertVoiceToMath(editedText);

            try {

                const answer =
                    calculateExpression(
                        currentExpression
                    );

                const formattedAnswer =
                    formatResult(answer);

                resultBox.textContent =
                    formattedAnswer;

                speakVoiceAnswer(
                    formattedAnswer
                );

                statusText.textContent =
                    "Calculation completed.";

                recognizedText.contentEditable =
                    "false";

                recognizedText.style.outline =
                    "";

                recognizedText.style.cursor =
                    "";

            } catch (error) {

                console.error(
                    "Edited calculation error:",
                    error
                );

                resultBox.textContent =
                    "Unable to calculate expression.";

            }
        }

    }
);

            recognizedText.contentEditable = "true";

            recognizedText.focus();

            recognizedText.style.outline =
                "1px solid #4d8cff";

            recognizedText.style.cursor =
                "text";

            editRecognizedText.classList.add("editing");

        }
    );

}
// ==========================================
// GLOBAL SEARCH
// ==========================================

const globalSearch =
    document.getElementById("globalSearch");

if (globalSearch) {

    const searchPages = {
        home: "dashboard.html",
        dashboard: "dashboard.html",

        voice: "voice-input.html",
        "voice input": "voice-input.html",
        "voice calculator": "voice-input.html",

        calculator: "calculator.html",

        graph: "graph.html",
        "graph plot": "graph.html",
        "graph & plot": "graph.html",

        formulas: "formulas.html",
        "formula library": "formulas.html",

        converter: "converter.html",
        "unit converter": "converter.html",

        history: "history.html",

        saved: "saved.html",
        "saved calculations": "saved.html",

        settings: "settings.html",

        profile: "profile.html",

        about: "about.html",

        help: "help.html",

        upgrade: "upgrade.html"
    };


    globalSearch.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Enter") {
                return;
            }

            const query =
                globalSearch.value
                    .trim()
                    .toLowerCase();

            if (!query) {
                return;
            }


            // Exact match
            if (searchPages[query]) {

                window.location.href =
                    searchPages[query];

                return;
            }


            // Partial match
            const matchedPage =
                Object.keys(searchPages).find(
                    (page) =>
                        page.includes(query) ||
                        query.includes(page)
                );


            if (matchedPage) {

                window.location.href =
                    searchPages[matchedPage];

            } else {

                alert(
                    "No matching page or tool found."
                );

            }

        }
    );

}
// ==========================================
// SEARCH SUGGESTIONS
// ==========================================

const searchSuggestions =
    document.getElementById("searchSuggestions");

if (globalSearch && searchSuggestions) {

    const searchItems = [
        {
            name: "Dashboard",
            icon: "fa-house",
            page: "dashboard.html"
        },
        {
            name: "Calculator",
            icon: "fa-calculator",
            page: "calculator.html"
        },
        {
            name: "Voice Input",
            icon: "fa-microphone",
            page: "voice-input.html"
        },
        {
            name: "Graph & Plot",
            icon: "fa-chart-line",
            page: "graph.html"
        },
        {
            name: "Formula Library",
            icon: "fa-book",
            page: "formulas.html"
        },
        {
            name: "Unit Converter",
            icon: "fa-arrows-left-right",
            page: "converter.html"
        },
        {
            name: "History",
            icon: "fa-clock-rotate-left",
            page: "history.html"
        },
        {
            name: "Saved Calculations",
            icon: "fa-bookmark",
            page: "saved.html"
        },
        {
            name: "Settings",
            icon: "fa-gear",
            page: "settings.html"
        },
        {
            name: "Profile",
            icon: "fa-user",
            page: "profile.html"
        },
        {
            name: "Help",
            icon: "fa-circle-question",
            page: "help.html"
        },
        {
            name: "About",
            icon: "fa-circle-info",
            page: "about.html"
        },
        {
            name: "Upgrade",
            icon: "fa-crown",
            page: "upgrade.html"
        }
    ];


    globalSearch.addEventListener(
        "input",
        () => {

            const query =
                globalSearch.value
                    .trim()
                    .toLowerCase();

            searchSuggestions.innerHTML = "";

            if (!query) {

                searchSuggestions.style.display =
                    "none";

                return;
            }


            const matches =
                searchItems.filter(
                    (item) =>
                        item.name
                            .toLowerCase()
                            .includes(query)
                );


            if (!matches.length) {

                searchSuggestions.innerHTML = `
                    <div class="search-no-result">
                        No matching page found
                    </div>
                `;

                searchSuggestions.style.display =
                    "block";

                return;
            }


            matches.forEach((item) => {

                const suggestion =
                    document.createElement("div");

                suggestion.className =
                    "search-suggestion-item";

                suggestion.innerHTML = `
                    <i class="fa-solid ${item.icon}"></i>
                    <span>${item.name}</span>
                `;


                suggestion.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            item.page;

                    }
                );


                searchSuggestions.appendChild(
                    suggestion
                );

            });


            searchSuggestions.style.display =
                "block";

        }
    );

}
// ==========================================
// CLOSE SEARCH SUGGESTIONS
// ==========================================

if (globalSearch && searchSuggestions) {

    document.addEventListener(
        "click",
        (event) => {

            if (
                !globalSearch.contains(event.target) &&
                !searchSuggestions.contains(event.target)
            ) {

                searchSuggestions.style.display =
                    "none";

            }

        }
    );


    globalSearch.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                searchSuggestions.style.display =
                    "none";

                globalSearch.blur();

            }

        }
    );

}
// ==========================================
// SEARCH KEYBOARD NAVIGATION
// ==========================================

let selectedSearchIndex = -1;

if (globalSearch && searchSuggestions) {

    globalSearch.addEventListener(
        "keydown",
        (event) => {

            const suggestions =
                searchSuggestions.querySelectorAll(
                    ".search-suggestion-item"
                );

            if (!suggestions.length) {
                return;
            }


            // Arrow Down
            if (event.key === "ArrowDown") {

                event.preventDefault();

                selectedSearchIndex++;

                if (
                    selectedSearchIndex >=
                    suggestions.length
                ) {
                    selectedSearchIndex = 0;
                }

                updateSearchSelection(
                    suggestions
                );

            }


            // Arrow Up
            else if (event.key === "ArrowUp") {

                event.preventDefault();

                selectedSearchIndex--;

                if (selectedSearchIndex < 0) {
                    selectedSearchIndex =
                        suggestions.length - 1;
                }

                updateSearchSelection(
                    suggestions
                );

            }


            // Enter
            else if (
                event.key === "Enter" &&
                selectedSearchIndex >= 0
            ) {

                event.preventDefault();

                suggestions[
                    selectedSearchIndex
                ].click();

            }

        }
    );

}


// ==========================================
// UPDATE SEARCH SELECTION
// ==========================================

function updateSearchSelection(
    suggestions
) {

    suggestions.forEach(
        (item, index) => {

            if (
                index ===
                selectedSearchIndex
            ) {

                item.style.background =
                    "#102d49";

                item.scrollIntoView({
                    block: "nearest"
                });

            } else {

                item.style.background =
                    "";

            }

        }
    );

}
// ==========================================
// CLEAR GLOBAL SEARCH
// ==========================================

const clearGlobalSearch =
    document.getElementById("clearGlobalSearch");

if (clearGlobalSearch && globalSearch) {

    clearGlobalSearch.style.display =
        "none";


    globalSearch.addEventListener(
        "input",
        () => {

            clearGlobalSearch.style.display =
                globalSearch.value.trim()
                    ? "flex"
                    : "none";

        }
    );


    clearGlobalSearch.addEventListener(
        "click",
        () => {

            globalSearch.value = "";

            if (searchSuggestions) {

                searchSuggestions.innerHTML =
                    "";

                searchSuggestions.style.display =
                    "none";

            }

            clearGlobalSearch.style.display =
                "none";

            globalSearch.focus();

        }
    );

}
