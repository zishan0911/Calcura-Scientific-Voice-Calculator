const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Formula = require("./models/Formula");

const formulas = [
    {
        name: "Quadratic Formula",
        expression: "x = (−b ± √(b² − 4ac)) / 2a",
        category: "Algebra",
        description: "Solves ax² + bx + c = 0",
        level: "College",
        difficulty: "Medium",
        icon: "fa-square-root-variable"
    },
    {
        name: "Sine Rule",
        expression: "a / sin A = b / sin B = c / sin C",
        category: "Trigonometry",
        description: "Used in any triangle (A, B, C are angles)",
        level: "College",
        difficulty: "Medium",
        icon: "fa-triangle-exclamation"
    },
    {
        name: "Cosine Rule",
        expression: "c² = a² + b² − 2ab cos C",
        category: "Trigonometry",
        description: "Used to find a side or angle in a triangle.",
        level: "College",
        difficulty: "Medium",
        icon: "fa-triangle-exclamation"
    },
    {
        name: "Derivative (Basic)",
        expression: "d/dx (xⁿ) = nxⁿ⁻¹",
        category: "Calculus",
        description: "Power rule for differentiation.",
        level: "College",
        difficulty: "Easy",
        icon: "fa-integral"
    },
    {
        name: "Integration (Basic)",
        expression: "∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C",
        category: "Calculus",
        description: "Basic integration rule.",
        level: "College",
        difficulty: "Easy",
        icon: "fa-integral"
    },
    {
        name: "Matrix Multiplication",
        expression: "C = A × B",
        category: "Matrices",
        description: "Multiplies two matrices.",
        level: "College",
        difficulty: "Medium",
        icon: "fa-border-all"
    },
    {
        name: "Standard Deviation",
        expression: "σ = √(Σ(xᵢ − μ)² / n)",
        category: "Statistics",
        description: "Measures data dispersion.",
        level: "College",
        difficulty: "Medium",
        icon: "fa-chart-column"
    },
    {
        name: "Distance Formula",
        expression: "d = √((x₂ − x₁)² + (y₂ − y₁)²)",
        category: "Geometry",
        description: "Distance between two points (x₁,y₁) and (x₂,y₂).",
        level: "School",
        difficulty: "Easy",
        icon: "fa-cube"
    },
    {
        name: "Kinematic Equation",
        expression: "v = u + at",
        category: "Physics",
        description: "Final velocity with constant acceleration.",
        level: "College",
        difficulty: "Easy",
        icon: "fa-atom"
    },
    {
        name: "Area of Circle",
        expression: "A = πr²",
        category: "Geometry",
        description: "Calculates the area of a circle.",
        level: "School",
        difficulty: "Easy",
        icon: "fa-cube"
    },
    {
        name: "Circumference of Circle",
        expression: "C = 2πr",
        category: "Geometry",
        description: "Calculates the circumference of a circle.",
        level: "School",
        difficulty: "Easy",
        icon: "fa-cube"
    },
    {
        name: "Pythagorean Theorem",
        expression: "a² + b² = c²",
        category: "Geometry",
        description: "Relationship between the sides of a right triangle.",
        level: "School",
        difficulty: "Easy",
        icon: "fa-cube"
    },
    {
        name: "Newton's Second Law",
        expression: "F = ma",
        category: "Physics",
        description: "Relates force, mass and acceleration.",
        level: "School",
        difficulty: "Easy",
        icon: "fa-atom"
    },
    {
        name: "Kinetic Energy",
        expression: "KE = ½mv²",
        category: "Physics",
        description: "Calculates the kinetic energy of an object.",
        level: "School",
        difficulty: "Easy",
        icon: "fa-atom"
    },
    {
        name: "Ohm's Law",
        expression: "V = IR",
        category: "Physics",
        description: "Relates voltage, current and resistance.",
        level: "School",
        difficulty: "Easy",
        icon: "fa-atom"
    },
    {
        name: "Mean",
        expression: "Mean = Σx / n",
        category: "Statistics",
        description: "Calculates the arithmetic average of values.",
        level: "School",
        difficulty: "Easy",
        icon: "fa-chart-column"
    },
    {
        name: "Probability",
        expression: "P(E) = Favorable Outcomes / Total Outcomes",
        category: "Statistics",
        description: "Calculates the probability of an event.",
        level: "School",
        difficulty: "Easy",
        icon: "fa-chart-column"
    }
];

async function seedFormulas() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected.");

        let added = 0;
        let skipped = 0;

        for (const formula of formulas) {
            const exists = await Formula.findOne({
                name: formula.name,
                expression: formula.expression
            });

            if (exists) {
                skipped++;
                continue;
            }

            await Formula.create(formula);

            added++;
            console.log(`Added: ${formula.name}`);
        }

        console.log("");
        console.log("=================================");
        console.log("Formula migration completed");
        console.log("Added:", added);
        console.log("Skipped:", skipped);
        console.log("=================================");

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("Formula migration failed:");
        console.error(error);

        await mongoose.connection.close();
        process.exit(1);
    }
}

seedFormulas();