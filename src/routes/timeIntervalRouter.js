const router = require("express").Router();
const { createTimeInterval, getAllTimeIntervals, editTimeInterval, deleteTimeInterval } = require("../controllers/timeIntervalController");



router.post("/create",createTimeInterval);
router.post("/",getAllTimeIntervals);
router.put("/edit/:id",editTimeInterval);
router.delete("/delete/:id",deleteTimeInterval);






module.exports = router;