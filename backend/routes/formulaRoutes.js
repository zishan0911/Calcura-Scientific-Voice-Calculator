const express = require("express");

const router = express.Router();

const {
    getPublicFormulas,
    getPublicFormula,
    incrementPublicFormulaViews
} = require("../controllers/formulaController");


/* =========================================================
   PUBLIC FORMULA LIBRARY
========================================================= */

router.get(
    "/",
    getPublicFormulas
);


/* =========================================================
   SINGLE FORMULA
========================================================= */

router.get(
    "/:id",
    getPublicFormula
);


/* =========================================================
   FORMULA VIEWS
========================================================= */

router.patch(
    "/:id/views",
    incrementPublicFormulaViews
);


module.exports = router;