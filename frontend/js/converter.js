/* =========================================================
   CALCURA - UNIT CONVERTER
   FINAL CLEAN VERSION
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const categoryTabs =
    document.querySelectorAll(".category-tab");

const fromValue =
    document.getElementById("fromValue");

const toValue =
    document.getElementById("toValue");

const fromUnit =
    document.getElementById("fromUnit");

const toUnit =
    document.getElementById("toUnit");

const switchUnitsBtn =
    document.getElementById("switchUnitsBtn");

const swapButton =
    document.getElementById("swapButton");

const result =
    document.getElementById("result");

const resultSecondary =
    document.getElementById("resultSecondary");

const converterTitle =
    document.getElementById("converterTitle");

const converterDescription =
    document.getElementById("converterDescription");

const categoryIcon =
    document.getElementById("categoryIcon");

const commonTitle =
    document.getElementById("commonTitle");

const commonConversions =
    document.getElementById("commonConversions");

const quickConvertList =
    document.getElementById("quickConvertList");

const normalConverter =
    document.getElementById("normalConverter");

const marksConverter =
    document.getElementById("marksConverter");

const copyResultBtn =
    document.getElementById("copyResultBtn");

const shareResultBtn =
    document.getElementById("shareResultBtn");


/* =========================================================
   MARKS ELEMENTS
   IMPORTANT: DECLARE ONLY ONCE
========================================================= */

const marksValue =
    document.getElementById("marksValue");

const marksFromUnit =
    document.getElementById("marksFromUnit");

const marksToUnit =
    document.getElementById("marksToUnit");

const marksResultValue =
    document.getElementById("marksResultValue");

const maximumMarks =
    document.getElementById("maximumMarks");

const totalMarksSection =
    document.getElementById("totalMarksSection");

const marksSwapButton =
    document.getElementById("marksSwapButton");

const semesterList =
    document.getElementById("semesterList");

const addSemesterBtn =
    document.getElementById("addSemesterBtn");

const calculateCgpaBtn =
    document.getElementById("calculateCgpaBtn");


/* =========================================================
   UNIT DATA
========================================================= */

const units = {

    length: {
        Meter: 1,
        Kilometer: 1000,
        Centimeter: 0.01,
        Millimeter: 0.001,
        Mile: 1609.344,
        Foot: 0.3048,
        Inch: 0.0254
    },

    weight: {
        Kilogram: 1,
        Gram: 0.001,
        Milligram: 0.000001,
        Pound: 0.45359237,
        Ounce: 0.0283495
    },

    temperature: {
        Celsius: 1,
        Fahrenheit: 1,
        Kelvin: 1
    },

    time: {
        Second: 1,
        Minute: 60,
        Hour: 3600,
        Day: 86400
    },

    area: {
        "Square Meter": 1,
        "Square Kilometer": 1000000,
        "Square Foot": 0.092903,
        Acre: 4046.8564224
    },

    volume: {
        Liter: 1,
        Milliliter: 0.001,
        "Cubic Meter": 1000,
        Gallon: 3.785411784
    },

    speed: {
        "Meter/second": 1,
        "Kilometer/hour": 0.2777777778,
        "Mile/hour": 0.44704,
        "Foot/second": 0.3048,
        Knot: 0.5144444444
    },

    energy: {
        Joule: 1,
        Kilojoule: 1000,
        Calorie: 4.184,
        Kilocalorie: 4184,
        "Watt-hour": 3600,
        "Kilowatt-hour": 3600000
    },

    data: {
        Bit: 1,
        Byte: 8,
        Kilobyte: 8000,
        Megabyte: 8000000,
        Gigabyte: 8000000000,
        Terabyte: 8000000000000
    }

};


/* =========================================================
   CATEGORY INFORMATION
========================================================= */

const categoryInfo = {

    length: {
        title: "Length Converter",
        description:
            "Convert between meters, kilometers, miles, feet, inches and more.",
        icon: "fa-ruler"
    },

    weight: {
        title: "Weight Converter",
        description:
            "Convert kilograms, grams, pounds, ounces and more.",
        icon: "fa-weight-hanging"
    },

    temperature: {
        title: "Temperature Converter",
        description:
            "Convert Celsius, Fahrenheit and Kelvin easily.",
        icon: "fa-temperature-half"
    },

    time: {
        title: "Time Converter",
        description:
            "Convert seconds, minutes, hours and days.",
        icon: "fa-clock"
    },

    area: {
        title: "Area Converter",
        description:
            "Convert square meters, square kilometers, acres and more.",
        icon: "fa-border-all"
    },

    volume: {
        title: "Volume Converter",
        description:
            "Convert liters, milliliters, gallons and cubic meters.",
        icon: "fa-cube"
    },

    speed: {
        title: "Speed Converter",
        description:
            "Convert km/h, m/s, mph, knots and other speed units.",
        icon: "fa-gauge-high"
    },

    energy: {
        title: "Energy Converter",
        description:
            "Convert joules, calories, watt-hours and more.",
        icon: "fa-bolt"
    },

    data: {
        title: "Data Converter",
        description:
            "Convert bits, bytes, KB, MB, GB and TB.",
        icon: "fa-database"
    },

    marks: {
        title: "Marks Converter",
        description:
            "Calculate percentage, CGPA and SGPA for academic calculations.",
        icon: "fa-graduation-cap"
    }

};


/* =========================================================
   CATEGORY ICON
========================================================= */

function updateCategoryIcon(category) {

    if (!categoryIcon) return;

    const info = categoryInfo[category];

    categoryIcon.innerHTML =
        `<i class="fa-solid ${info.icon}"></i>`;
}


/* =========================================================
   LOAD NORMAL UNITS
========================================================= */

function loadUnits(category) {

    if (!fromUnit || !toUnit) return;

    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";

    const unitNames =
        Object.keys(units[category]);

    unitNames.forEach(unit => {

        const fromOption =
            document.createElement("option");

        fromOption.value = unit;
        fromOption.textContent = unit;

        fromUnit.appendChild(fromOption);


        const toOption =
            document.createElement("option");

        toOption.value = unit;
        toOption.textContent = unit;

        toUnit.appendChild(toOption);

    });


    if (unitNames.length > 1) {
        toUnit.selectedIndex = 1;
    }

}


/* =========================================================
   TEMPERATURE
========================================================= */

function convertTemperature(value, from, to) {

    let celsius;


    if (from === "Celsius") {

        celsius = value;

    }

    else if (from === "Fahrenheit") {

        celsius =
            (value - 32) * 5 / 9;

    }

    else {

        celsius =
            value - 273.15;

    }


    if (to === "Celsius") {

        return celsius;

    }


    if (to === "Fahrenheit") {

        return (celsius * 9 / 5) + 32;

    }


    return celsius + 273.15;

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(value) {

    if (!Number.isFinite(value)) {
        return "Invalid";
    }

    return Number(
        value.toFixed(8)
    ).toLocaleString(
        undefined,
        {
            maximumFractionDigits: 8
        }
    );

}


function formatMarksNumber(value) {

    if (!Number.isFinite(value)) {
        return "0";
    }

    return Number(
        value.toFixed(2)
    ).toString();

}


/* =========================================================
   UNIT SHORT NAMES
========================================================= */

function shortUnit(unit) {

    const map = {

        Meter: "m",
        Kilometer: "km",
        Centimeter: "cm",
        Millimeter: "mm",
        Mile: "mi",
        Foot: "ft",
        Inch: "in",

        Kilogram: "kg",
        Gram: "g",
        Milligram: "mg",
        Pound: "lb",
        Ounce: "oz",

        Celsius: "°C",
        Fahrenheit: "°F",
        Kelvin: "K",

        "Square Meter": "m²",
        "Square Kilometer": "km²",
        "Square Foot": "ft²",
        Acre: "acre",

        Liter: "L",
        Milliliter: "mL",
        "Cubic Meter": "m³",
        Gallon: "gal",

        Second: "s",
        Minute: "min",
        Hour: "hr",
        Day: "day",

        "Meter/second": "m/s",
        "Kilometer/hour": "km/h",
        "Mile/hour": "mph",
        "Foot/second": "ft/s",
        Knot: "kn",

        Joule: "J",
        Kilojoule: "kJ",
        Calorie: "cal",
        Kilocalorie: "kcal",
        "Watt-hour": "Wh",
        "Kilowatt-hour": "kWh",

        Bit: "bit",
        Byte: "B",
        Kilobyte: "KB",
        Megabyte: "MB",
        Gigabyte: "GB",
        Terabyte: "TB"

    };

    return map[unit] || unit;

}


/* =========================================================
   SINGLE CONVERSION
========================================================= */

function getSingleConversion(
    category,
    from,
    to
) {

    if (from === to) {
        return 1;
    }


    if (category === "temperature") {

        return convertTemperature(
            1,
            from,
            to
        );

    }


    return (
        units[category][from] /
        units[category][to]
    );

}


/* =========================================================
   NORMAL CONVERSION
========================================================= */

function convertNormal() {

    if (
        !fromValue ||
        !toValue ||
        !fromUnit ||
        !toUnit
    ) {
        return;
    }


    const value =
        Number(fromValue.value);


    if (!Number.isFinite(value)) {

        toValue.value = "";

        if (result) {
            result.textContent =
                "Enter a value";
        }

        if (resultSecondary) {
            resultSecondary.textContent = "";
        }

        return;
    }


    const activeTab =
        document.querySelector(
            ".category-tab.active"
        );


    if (!activeTab) return;


    const category =
        activeTab.dataset.category;


    if (category === "marks") {
        return;
    }


    const from =
        fromUnit.value;

    const to =
        toUnit.value;


    let converted;


    if (from === to) {

        converted = value;

    }

    else if (category === "temperature") {

        converted =
            convertTemperature(
                value,
                from,
                to
            );

    }

    else {

        const baseValue =
            value * units[category][from];

        converted =
            baseValue /
            units[category][to];

    }


    toValue.value =
        formatNumber(converted);


    if (result) {

        result.textContent =
            `${formatNumber(value)} ${shortUnit(from)} = ${formatNumber(converted)} ${shortUnit(to)}`;

    }


    if (resultSecondary) {

        resultSecondary.textContent =
            `1 ${shortUnit(from)} = ${formatNumber(
                getSingleConversion(
                    category,
                    from,
                    to
                )
            )} ${shortUnit(to)}`;

    }

}


/* =========================================================
   COMMON CONVERSIONS
========================================================= */

const commonData = {

    length: [
        "1 m = 3.28084 ft",
        "1 km = 0.621371 mi",
        "1 mi = 1.60934 km",
        "1 in = 2.54 cm"
    ],

    weight: [
        "1 kg = 1000 g",
        "1 kg = 2.20462 lb",
        "1 lb = 453.592 g",
        "1 oz = 28.3495 g"
    ],

    temperature: [
        "0°C = 32°F",
        "100°C = 212°F",
        "0°C = 273.15 K",
        "25°C = 77°F"
    ],

    time: [
        "1 min = 60 sec",
        "1 hr = 60 min",
        "1 day = 24 hr",
        "1 week = 7 days"
    ],

    area: [
        "1 km² = 1,000,000 m²",
        "1 acre = 4046.86 m²",
        "1 m² = 10.7639 ft²",
        "1 ft² = 0.092903 m²"
    ],

    volume: [
        "1 L = 1000 mL",
        "1 m³ = 1000 L",
        "1 gal = 3.78541 L",
        "1 L = 0.264172 gal"
    ],

    speed: [
        "1 m/s = 3.6 km/h",
        "1 km/h = 0.621371 mph",
        "1 mph = 1.60934 km/h",
        "1 knot = 1.852 km/h"
    ],

    energy: [
        "1 kJ = 1000 J",
        "1 kcal = 4184 J",
        "1 Wh = 3600 J",
        "1 kWh = 3.6 MJ"
    ],

    data: [
        "1 Byte = 8 bits",
        "1 KB = 1000 Bytes",
        "1 MB = 1000 KB",
        "1 GB = 1000 MB"
    ]

};


function renderCommonConversions(category) {

    if (!commonConversions) return;

    const data =
        commonData[category] || [];

    commonConversions.innerHTML =
        data.map(item => `
            <div class="common-item">
                ${item}
            </div>
        `).join("");

}


function renderMarksCommonConversions() {

    if (!commonConversions) return;

    const data = [

        "100% = 10 CGPA",
        "90% = 9 CGPA",
        "80% = 8 CGPA",
        "70% = 7 CGPA"

    ];


    commonConversions.innerHTML =
        data.map(item => `
            <div class="common-item">
                ${item}
            </div>
        `).join("");

}


/* =========================================================
   QUICK CONVERT
========================================================= */

const quickCategories = [

    {
        id: "length",
        name: "Length",
        icon: "fa-ruler"
    },

    {
        id: "weight",
        name: "Weight",
        icon: "fa-weight-hanging"
    },

    {
        id: "temperature",
        name: "Temperature",
        icon: "fa-temperature-half"
    },

    {
        id: "time",
        name: "Time",
        icon: "fa-clock"
    },

    {
        id: "area",
        name: "Area",
        icon: "fa-border-all"
    },

    {
        id: "volume",
        name: "Volume",
        icon: "fa-cube"
    },

    {
        id: "speed",
        name: "Speed",
        icon: "fa-gauge-high"
    },

    {
        id: "energy",
        name: "Energy",
        icon: "fa-bolt"
    },

    {
        id: "data",
        name: "Data",
        icon: "fa-database"
    },

    {
        id: "marks",
        name: "Marks",
        icon: "fa-graduation-cap"
    }

];


function renderQuickConvert() {

    if (!quickConvertList) return;


    quickConvertList.innerHTML =
        quickCategories.map(item => `

            <div
                class="quick-item"
                data-quick-category="${item.id}"
            >

                <i class="fa-solid ${item.icon}"></i>

                <span>${item.name}</span>

                <i class="fa-solid fa-chevron-right quick-arrow"></i>

            </div>

        `).join("");


    document
        .querySelectorAll(".quick-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    changeCategory(
                        item.dataset.quickCategory
                    );

                }
            );

        });

}


/* =========================================================
   MARKS CONVERSION
========================================================= */

/* =========================================================
   MARKS CONVERSION
   ========================================================= */

/* =========================================================
   MARKS CONVERSION
   CALCURA - SGPA / CGPA / PERCENTAGE
========================================================= */

/* =========================================================
   MARKS CONVERSION
========================================================= */

function convertMarks() {

    if (
        !marksValue ||
        !marksFromUnit ||
        !marksToUnit ||
        !marksResultValue
    ) {
        return;
    }


    const value =
        Number(marksValue.value);

    const from =
        marksFromUnit.value;

    const to =
        marksToUnit.value;


    /* =====================================================
       SHOW / HIDE MAXIMUM MARKS FIELD
    ===================================================== */

    const needsMaximumMarks =
        from === "totalMarks" ||
        to === "totalMarks";

    if (totalMarksSection) {

        totalMarksSection.style.display =
            needsMaximumMarks
                ? "block"
                : "none";

    }


    /* =====================================================
       EMPTY INPUT
    ===================================================== */

    if (
        marksValue.value === "" ||
        !Number.isFinite(value)
    ) {

        marksResultValue.value = "0";

        if (result) {
            result.textContent =
                "Enter a value to convert";
        }

        if (resultSecondary) {
            resultSecondary.textContent = "";
        }

        return;
    }


    /* =====================================================
       PERCENTAGE VALIDATION
    ===================================================== */

    if (
        from === "percentage" &&
        (value < 0 || value > 100)
    ) {

        marksResultValue.value = "0";

        if (result) {
            result.textContent =
                "Percentage must be between 0 and 100";
        }

        if (resultSecondary) {
            resultSecondary.textContent = "";
        }

        return;
    }


    /* =====================================================
       SGPA / CGPA VALIDATION
    ===================================================== */

    if (
        (from === "sgpa" || from === "cgpa") &&
        (value < 0 || value > 10)
    ) {

        marksResultValue.value = "0";

        if (result) {
            result.textContent =
                `${getMarksUnitName(from)} must be between 0 and 10`;
        }

        if (resultSecondary) {
            resultSecondary.textContent = "";
        }

        return;
    }


    /* =====================================================
       PERCENTAGE → TOTAL MARKS

       Formula:
       (Percentage × Maximum Marks) / 100
    ===================================================== */

    if (
        from === "percentage" &&
        to === "totalMarks"
    ) {

        const max =
            Number(
                maximumMarks
                    ? maximumMarks.value
                    : ""
            );


        if (
            !maximumMarks ||
            maximumMarks.value === "" ||
            !Number.isFinite(max) ||
            max <= 0
        ) {

            marksResultValue.value = "0";

            if (result) {
                result.textContent =
                    "Enter maximum / total marks";
            }

            if (resultSecondary) {
                resultSecondary.textContent = "";
            }

            return;
        }


        const converted =
            (value * max) / 100;


        marksResultValue.value =
            formatMarksNumber(converted);


        if (result) {

            result.textContent =
                `${formatMarksNumber(value)}% of ${formatMarksNumber(max)} = ${formatMarksNumber(converted)} marks`;

        }


        if (resultSecondary) {

            resultSecondary.textContent =
                `Formula: (${formatMarksNumber(value)} × ${formatMarksNumber(max)}) ÷ 100`;

        }

        return;
    }


    /* =====================================================
       TOTAL MARKS → PERCENTAGE

       Formula:
       (Obtained Marks / Maximum Marks) × 100
    ===================================================== */

    if (
        from === "totalMarks" &&
        to === "percentage"
    ) {

        const max =
            Number(
                maximumMarks
                    ? maximumMarks.value
                    : ""
            );


        if (
            !maximumMarks ||
            maximumMarks.value === "" ||
            !Number.isFinite(max) ||
            max <= 0
        ) {

            marksResultValue.value = "0";

            if (result) {
                result.textContent =
                    "Enter maximum / total marks";
            }

            if (resultSecondary) {
                resultSecondary.textContent = "";
            }

            return;
        }


        if (value > max) {

            marksResultValue.value = "0";

            if (result) {
                result.textContent =
                    "Obtained marks cannot exceed total marks";
            }

            if (resultSecondary) {
                resultSecondary.textContent = "";
            }

            return;
        }


        const converted =
            (value / max) * 100;


        marksResultValue.value =
            formatMarksNumber(converted);


        if (result) {

            result.textContent =
                `${formatMarksNumber(value)} / ${formatMarksNumber(max)} = ${formatMarksNumber(converted)}%`;

        }


        if (resultSecondary) {

            resultSecondary.textContent =
                `Formula: (${formatMarksNumber(value)} ÷ ${formatMarksNumber(max)}) × 100`;

        }

        return;
    }


    /* =====================================================
       SAME UNIT
    ===================================================== */

    if (from === to) {

        marksResultValue.value =
            formatMarksNumber(value);

        if (result) {

            result.textContent =
                `${formatMarksNumber(value)} ${getMarksUnitName(from)} = ${formatMarksNumber(value)} ${getMarksUnitName(to)}`;

        }

        if (resultSecondary) {

            resultSecondary.textContent =
                "Both units are the same.";

        }

        return;
    }


    /* =====================================================
       SGPA → PERCENTAGE

       Formula:
       (SGPA × 10) − 7.5
    ===================================================== */

    if (
        from === "sgpa" &&
        to === "percentage"
    ) {

        const converted =
            (value * 10) - 7.5;


        showMarksResult(
            value,
            converted,
            from,
            to,
            "(SGPA × 10) − 7.5"
        );

        return;
    }


    /* =====================================================
       PERCENTAGE → SGPA

       Formula:
       (Percentage + 7.5) / 10
    ===================================================== */

    if (
        from === "percentage" &&
        to === "sgpa"
    ) {

        const converted =
            (value + 7.5) / 10;


        showMarksResult(
            value,
            converted,
            from,
            to,
            "(Percentage + 7.5) ÷ 10"
        );

        return;
    }


    /* =====================================================
       CGPA → PERCENTAGE
    ===================================================== */

    if (
        from === "cgpa" &&
        to === "percentage"
    ) {

        const converted =
            (value * 10) - 7.5;


        showMarksResult(
            value,
            converted,
            from,
            to,
            "(CGPA × 10) − 7.5"
        );

        return;
    }


    /* =====================================================
       PERCENTAGE → CGPA
    ===================================================== */

    if (
        from === "percentage" &&
        to === "cgpa"
    ) {

        const converted =
            (value + 7.5) / 10;


        showMarksResult(
            value,
            converted,
            from,
            to,
            "(Percentage + 7.5) ÷ 10"
        );

        return;
    }


    /* =====================================================
       SGPA → CGPA

       Exact CGPA requires semester-wise
       SGPA + credits.
    ===================================================== */

    if (
        from === "sgpa" &&
        to === "cgpa"
    ) {

        marksResultValue.value = "—";

        if (result) {

            result.textContent =
                "SGPA cannot directly calculate exact CGPA";

        }

        if (resultSecondary) {

            resultSecondary.textContent =
                "Enter semester SGPA and credits below to calculate CGPA.";

        }

        return;
    }


    /* =====================================================
       CGPA → SGPA
    ===================================================== */

    if (
        from === "cgpa" &&
        to === "sgpa"
    ) {

        marksResultValue.value = "—";

        if (result) {

            result.textContent =
                "CGPA cannot directly calculate SGPA";

        }

        if (resultSecondary) {

            resultSecondary.textContent =
                "SGPA depends on the individual semester.";

        }

        return;
    }

}


/* =========================================================
   MARKS UNIT NAME
========================================================= */

function getMarksUnitName(unit) {

    const names = {

        percentage: "Percentage",

        cgpa: "CGPA",

        sgpa: "SGPA"

    };

    return names[unit] || unit;

}


/* =========================================================
   SHOW MARKS RESULT
========================================================= */

function showMarksResult(
    value,
    converted,
    from,
    to,
    formula
) {

    const finalValue =
        Number(converted.toFixed(2));


    marksResultValue.value =
        formatMarksNumber(finalValue);


    if (result) {

        result.textContent =
            `${formatMarksNumber(value)} ${getMarksUnitName(from)} = ${formatMarksNumber(finalValue)} ${getMarksUnitName(to)}`;

    }


    if (resultSecondary) {

        resultSecondary.textContent =
            `Formula: ${formula}`;

    }

}


/* =========================================================
   MARKS UNIT NAME
   ========================================================= */

function getMarksUnitName(unit) {

    const names = {

        percentage: "Percentage (%)",

        cgpa: "CGPA",

        sgpa: "SGPA"

    };

    return names[unit] || unit;
}


/* =========================================================
   SHOW MARKS RESULT
   ========================================================= */

function showMarksResult(
    value,
    converted,
    from,
    to
) {

    marksResultValue.value =
        formatMarksNumber(converted);


    if (result) {

        result.textContent =
            `${formatMarksNumber(value)} ${getMarksUnitName(from)} = ${formatMarksNumber(converted)} ${getMarksUnitName(to)}`;

    }


    if (resultSecondary) {

        resultSecondary.textContent =
            `${getMarksUnitName(from)} converted to ${getMarksUnitName(to)}`;

    }

}


/* =========================================================
   CHANGE CATEGORY
========================================================= */

function changeCategory(category) {

    categoryTabs.forEach(tab => {

        tab.classList.toggle(
            "active",
            tab.dataset.category === category
        );

    });


    const info =
        categoryInfo[category];


    if (!info) return;


    if (converterTitle) {

        converterTitle.textContent =
            info.title;

    }


    if (converterDescription) {

        converterDescription.textContent =
            info.description;

    }


    updateCategoryIcon(category);


    /* =====================================================
       MARKS
    ===================================================== */

    if (category === "marks") {

        if (normalConverter) {
            normalConverter.style.display =
                "none";
        }


        if (marksConverter) {
            marksConverter.style.display =
                "block";
        }


        if (switchUnitsBtn) {
            switchUnitsBtn.style.display =
                "none";
        }


        if (commonTitle) {
            commonTitle.textContent =
                "Common Academic Conversions";
        }


        renderMarksCommonConversions();


        if (marksValue) {
            marksValue.value = "";
        }


        if (marksResultValue) {
            marksResultValue.value = "0";
        }


        if (result) {
            result.textContent =
                "Enter marks to convert";
        }


        if (resultSecondary) {
            resultSecondary.textContent = "";
        }


        return;

    }


    /* =====================================================
       NORMAL CONVERTER
    ===================================================== */

    if (normalConverter) {
        normalConverter.style.display =
            "block";
    }


    if (marksConverter) {
        marksConverter.style.display =
            "none";
    }


    if (switchUnitsBtn) {
        switchUnitsBtn.style.display =
            "flex";
    }


    loadUnits(category);


    if (fromValue) {

        fromValue.value =
            category === "length"
                ? 5
                : 1;

    }


    convertNormal();


    if (commonTitle) {

        commonTitle.textContent =
            `Common Conversions (${capitalize(category)})`;

    }


    renderCommonConversions(category);

}


/* =========================================================
   SWAP NORMAL UNITS
========================================================= */

function swapUnits() {

    if (!fromUnit || !toUnit) return;


    const oldFrom =
        fromUnit.value;


    const oldTo =
        toUnit.value;


    fromUnit.value =
        oldTo;


    toUnit.value =
        oldFrom;


    convertNormal();

}


/* =========================================================
   SWAP MARKS UNITS
========================================================= */

function swapMarksUnits() {

    if (!marksFromUnit || !marksToUnit) {
        return;
    }


    const oldFrom =
        marksFromUnit.value;


    const oldTo =
        marksToUnit.value;


    marksFromUnit.value =
        oldTo;


    marksToUnit.value =
        oldFrom;


    convertMarks();

}


/* =========================================================
   SEMESTER ROW
========================================================= */

function addSemester() {

    if (!semesterList) return;


    const semesterNumber =
        semesterList.children.length + 1;


    const row =
        document.createElement("div");


    row.className =
        "semester-row";


    row.innerHTML = `

        <div class="semester-number">
            Semester ${semesterNumber}
        </div>

        <input
            type="number"
            class="semester-sgpa"
            placeholder="SGPA"
            min="0"
            max="10"
            step="0.01"
        >

        <input
            type="number"
            class="semester-credit"
            placeholder="Credits"
            min="0"
            step="0.01"
        >

        <button
            type="button"
            class="remove-semester"
            title="Remove semester"
        >
            <i class="fa-solid fa-trash"></i>
        </button>

    `;


    semesterList.appendChild(row);


    row
        .querySelectorAll("input")
        .forEach(input => {

            input.addEventListener(
                "input",
                calculateCGPA
            );

        });


    updateSemesterNumbers();

}


/* =========================================================
   REMOVE SEMESTER
========================================================= */

if (semesterList) {

    semesterList.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    ".remove-semester"
                );


            if (!button) {
                return;
            }


            const rows =
                semesterList.querySelectorAll(
                    ".semester-row"
                );


            if (rows.length <= 1) {
                return;
            }


            button
                .closest(".semester-row")
                .remove();


            updateSemesterNumbers();

            calculateCGPA();

        }
    );

}


/* =========================================================
   UPDATE SEMESTER NUMBERS
========================================================= */

function updateSemesterNumbers() {

    if (!semesterList) return;


    const rows =
        semesterList.querySelectorAll(
            ".semester-row"
        );


    rows.forEach(
        (row, index) => {

            const number =
                row.querySelector(
                    ".semester-number"
                );


            if (number) {

                number.textContent =
                    `Semester ${index + 1}`;

            }

        }
    );

}


/* =========================================================
   CALCULATE CGPA
   FORMULA:
   CGPA = Σ(SGPA × Credits) / Σ(Credits)
========================================================= */

function calculateCGPA() {

    if (!semesterList) return;


    const rows =
        semesterList.querySelectorAll(
            ".semester-row"
        );


    let totalWeightedPoints = 0;

    let totalCredits = 0;


    for (const row of rows) {

        const sgpaInput =
            row.querySelector(
                ".semester-sgpa"
            );


        const creditInput =
            row.querySelector(
                ".semester-credit"
            );


        const sgpa =
            Number(sgpaInput.value);


        const credits =
            Number(creditInput.value);


        if (
            !Number.isFinite(sgpa) ||
            !Number.isFinite(credits) ||
            sgpa < 0 ||
            sgpa > 10 ||
            credits <= 0
        ) {

            if (result) {

                result.textContent =
                    "Please enter valid SGPA and credits for every semester.";

            }


            if (resultSecondary) {

                resultSecondary.textContent =
                    "SGPA must be between 0 and 10.";

            }


            return;

        }


        totalWeightedPoints +=
            sgpa * credits;


        totalCredits +=
            credits;

    }


    if (totalCredits <= 0) {

        if (result) {
            result.textContent =
                "Enter semester credits.";
        }

        if (resultSecondary) {
            resultSecondary.textContent = "";
        }

        return;

    }


    const cgpa =
        totalWeightedPoints /
        totalCredits;


    const finalCGPA =
        Number(
            cgpa.toFixed(2)
        );


    /* Put calculated CGPA into Marks input */

    if (marksValue) {
        marksValue.value =
            finalCGPA;
    }


    /* From = CGPA */

    if (marksFromUnit) {
        marksFromUnit.value =
            "cgpa";
    }


    /* If To = CGPA */

    if (
        marksToUnit &&
        marksToUnit.value === "cgpa"
    ) {

        if (marksResultValue) {

            marksResultValue.value =
                finalCGPA;

        }


        if (result) {

            result.textContent =
                `CGPA = ${finalCGPA}`;

        }


        if (resultSecondary) {

            resultSecondary.textContent =
                `Calculated from ${rows.length} semester(s) using credit-weighted SGPA.`;

        }


        return;

    }


    /* Otherwise convert CGPA */

    convertMarks();


    if (resultSecondary) {

        resultSecondary.textContent =
            `CGPA ${finalCGPA} calculated using total semester credits.`;

    }

}

/* =========================================================
   MONGODB CONVERTER API
========================================================= */

const CONVERTER_API =
    "http://localhost:5000/api/converter";


function getConverterToken() {

    return localStorage.getItem(
        "calcuraToken"
    );

}


/* =========================================================
   SAVE CONVERSION TO MONGODB
========================================================= */

async function saveConversionToMongoDB(data) {

    const token =
        getConverterToken();

    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                CONVERTER_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(data)
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => ({}));

            console.error(
                "Converter save failed:",
                errorData.message ||
                "Unknown error"
            );

            return;
        }


        const dataResponse =
            await response.json();

        console.log(
            "Conversion saved:",
            dataResponse
        );


    } catch (error) {

        console.error(
            "Converter MongoDB error:",
            error
        );

    }

}


/* =========================================================
   SAVE NORMAL CONVERSION
========================================================= */

function saveNormalConversion() {

    const activeTab =
        document.querySelector(
            ".category-tab.active"
        );


    if (!activeTab) {
        return;
    }


    const category =
        activeTab.dataset.category;


    if (category === "marks") {
        return;
    }


    if (
        !fromValue ||
        !toValue ||
        !fromUnit ||
        !toUnit
    ) {
        return;
    }


    const input =
        fromValue.value.trim();

    const output =
        toValue.value.trim();


    if (
        input === "" ||
        output === ""
    ) {
        return;
    }


    if (
        !Number.isFinite(
            Number(input)
        )
    ) {
        return;
    }


    const from =
        fromUnit.value;

    const to =
        toUnit.value;


    const resultText =
        result
            ? result.textContent.trim()
            : `${input} ${from} = ${output} ${to}`;


    saveConversionToMongoDB({

        category: category,

        inputValue: input,

        fromUnit: from,

        outputValue: output,

        toUnit: to,

        result: resultText,

        formula: ""

    });

}


/* =========================================================
   SAVE MARKS CONVERSION
========================================================= */

function saveMarksConversion() {

    if (
        !marksValue ||
        !marksResultValue ||
        !marksFromUnit ||
        !marksToUnit
    ) {
        return;
    }


    const input =
        marksValue.value.trim();

    const output =
        marksResultValue.value.trim();


    if (
        input === "" ||
        output === ""
    ) {
        return;
    }


    if (
        !Number.isFinite(
            Number(input)
        ) ||
        !Number.isFinite(
            Number(output)
        )
    ) {
        return;
    }


    const from =
        marksFromUnit.value;

    const to =
        marksToUnit.value;


    const resultText =
        result
            ? result.textContent.trim()
            : `${input} ${from} = ${output} ${to}`;


    saveConversionToMongoDB({

        category: "marks",

        inputValue: input,

        fromUnit: from,

        outputValue: output,

        toUnit: to,

        result: resultText,

        formula: ""

    });

}
/* =========================================================
   CONVERTER AUTO-SAVE DEBOUNCE
========================================================= */

let converterSaveTimer = null;

function scheduleNormalConversionSave() {

    clearTimeout(converterSaveTimer);

    converterSaveTimer = setTimeout(() => {

        saveNormalConversion();

    }, 800);

}


function scheduleMarksConversionSave() {

    clearTimeout(converterSaveTimer);

    converterSaveTimer = setTimeout(() => {

        saveMarksConversion();

    }, 800);

}
/* =========================================================
   EVENT LISTENERS
========================================================= */


/* Normal switch */

if (switchUnitsBtn) {

    switchUnitsBtn.addEventListener(
        "click",
        swapUnits
    );

}


/* Normal swap */

if (swapButton) {

    swapButton.addEventListener(
        "click",
        swapUnits
    );

}


/* Normal value */

if (fromValue) {

    fromValue.addEventListener(
        "input",
        () => {

            const activeTab =
                document.querySelector(
                    ".category-tab.active"
                );

            if (
                activeTab &&
                activeTab.dataset.category !== "marks"
            ) {

                convertNormal();

                scheduleNormalConversionSave();

            }

        }
    );

}


/* Normal units */

if (fromUnit) {

    fromUnit.addEventListener(
        "change",
        () => {

            convertNormal();

            scheduleNormalConversionSave();

        }
    );

}


if (toUnit) {

    toUnit.addEventListener(
        "change",
        () => {

            convertNormal();

            scheduleNormalConversionSave();

        }
    );

}


/* Marks value */

if (marksValue) {

    marksValue.addEventListener(
        "input",
        () => {

            convertMarks();

            scheduleMarksConversionSave();

        }
    );

}

if (maximumMarks) {

    maximumMarks.addEventListener(
        "input",
        () => {

            convertMarks();

            scheduleMarksConversionSave();

        }
    );

}

/* Marks units */

if (marksFromUnit) {

    marksFromUnit.addEventListener(
        "change",
        () => {

            convertMarks();

            scheduleMarksConversionSave();

        }
    );

}


if (marksToUnit) {

    marksToUnit.addEventListener(
        "change",
        () => {

            convertMarks();

            scheduleMarksConversionSave();

        }
    );

}


/* Marks swap */

if (marksSwapButton) {

    marksSwapButton.addEventListener(
        "click",
        swapMarksUnits
    );

}


/* Add semester */

if (addSemesterBtn) {

    addSemesterBtn.addEventListener(
        "click",
        addSemester
    );

}


/* Calculate CGPA */

if (calculateCgpaBtn) {

    calculateCgpaBtn.addEventListener(
        "click",
        calculateCGPA
    );

}


/* Category tabs */

categoryTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            changeCategory(
                tab.dataset.category
            );

        }
    );

});


/* Copy result */

if (copyResultBtn) {

    copyResultBtn.addEventListener(
        "click",
        async () => {

            const text =
                result
                    ? result.textContent.trim()
                    : "";


            try {

                await navigator.clipboard.writeText(
                    text
                );


                copyResultBtn.innerHTML =
                    `<i class="fa-solid fa-check"></i>`;


                setTimeout(() => {

                    copyResultBtn.innerHTML =
                        `<i class="fa-regular fa-copy"></i>`;

                }, 1200);

            }

            catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );

            }

        }
    );

}


/* Share */

if (shareResultBtn) {

    shareResultBtn.addEventListener(
        "click",
        async () => {

            const text =
                result
                    ? result.textContent.trim()
                    : "";


            if (navigator.share) {

                try {

                    await navigator.share({

                        title:
                            "Calcura Converter",

                        text:
                            text

                    });

                }

                catch (error) {

                    console.log(
                        "Share cancelled"
                    );

                }

            }

            else {

                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    alert(
                        "Result copied to clipboard."
                    );

                }

                catch {

                    alert(
                        "Unable to copy result."
                    );

                }

            }

        }
    );

}


/* =========================================================
   CAPITALIZE
========================================================= */

function capitalize(text) {

    return text.charAt(0).toUpperCase() +
           text.slice(1);

}


/* =========================================================
   INITIALIZE
========================================================= */

changeCategory("length");

renderQuickConvert();
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
