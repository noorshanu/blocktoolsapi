const router = require("express").Router();


const { addToPools, createToPool } = require("../controllers/projectContoller");
const { createProjectSettings, addWalletIdsToProjectSettings, deleteProjectSettings, removeWalletIdsFromProjectSettings, getProjectSettingsWithWallets, createToken, getTokens, createTokenFromPrivateKey, approveToken ,snipeToken} = require("../controllers/projectSettingsController");


router.post("/create", createProjectSettings);
router.post("/", getProjectSettingsWithWallets);
router.patch("/edit-walletlist/:id", addWalletIdsToProjectSettings);
router.put("/remove-walletlist/:id", removeWalletIdsFromProjectSettings);
router.delete("/delete/:id", deleteProjectSettings);
router.post("/create-token", createToken);
router.post("/get-tokens", getTokens);
router.post("/add-to-pool", addToPools);
router.post("/create-pool", createToPool);
router.post("/create-with-private-key", createTokenFromPrivateKey);
router.post('/approve-token',approveToken);
router.post('/snipe-token',snipeToken);






module.exports = router;
