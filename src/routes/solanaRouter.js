const router = require("express").Router();


const { transferSolana, getBalanceCheck } = require("../controllers/solanaController");



router.post("/send-sol",transferSolana);
router.post("/sol-balance",getBalanceCheck);







module.exports = router;
