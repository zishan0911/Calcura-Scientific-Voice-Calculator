const express = require("express");

const router = express.Router();

const {
    getAdminFormulas,
    getAdminFormula,
    createAdminFormula,
    updateAdminFormula,
    deleteAdminFormula,
    incrementFormulaViews
} = require("../controllers/adminFormulaController");

const adminOnly =
    require("../middleware/adminMiddleware");


/* =========================================================
   PUBLIC USER FORMULA LIBRARY
   User frontend can read ACTIVE formulas
========================================================= */

router.get(
    "/",
    getAdminFormulas
);


/* =========================================================
   ADMIN ONLY
========================================================= */

router.get(
    "/:id",
    adminOnly,
    getAdminFormula
);

router.post(
    "/",
    adminOnly,
    createAdminFormula
);

router.put(
    "/:id",
    adminOnly,
    updateAdminFormula
);

router.delete(
    "/:id",
    adminOnly,
    deleteAdminFormula
);


/* =========================================================
   PUBLIC FORMULA VIEW COUNT
========================================================= */

router.patch(
    "/:id/views",
    incrementFormulaViews
);


module.exports = router;