const router = require("express").Router();

const { createWalletSettings, listWalletSettings } = require("../controllers/walletSettingscontroller");



router.post("/create", createWalletSettings);
router.post("/", listWalletSettings);




module.exports = router;
