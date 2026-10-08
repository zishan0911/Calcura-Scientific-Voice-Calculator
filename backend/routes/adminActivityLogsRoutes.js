"use strict";

const express =
    require("express");

const router =
    express.Router();

const {
    getActivityLogs
} =
    require(
        "../controllers/adminActivityLogsController"
    );


/*
   IMPORTANT:
   Agar tumhare project mein existing
   admin authentication middleware hai,
   usko yahan use karo.

   Example:
   const { protect, adminOnly } =
       require("../middleware/authMiddleware");

   router.get(
       "/",
       protect,
       adminOnly,
       getActivityLogs
   );
*/


router.get(
    "/",
    getActivityLogs
);


module.exports = router;