const router = require("express").Router();
const { createSettings, getAllSettings, editSettings, deleteSettings } = require("../controllers/buySettingsController");
const { createSellSettings, getAllSellSettings, editSellSettings, deleteSellSettings } = require("../controllers/sellSettingsController");


//buySettings
router.post("/create-buysettings",  createSettings);
router.post("/buysettings",  getAllSettings);
router.put("/edit-buysettings/:id",  editSettings);
router.delete("/delete-buysettings",  deleteSettings);


//sell Settings
router.post("/create-sellsettings",  createSellSettings);
router.post("/sellsettings",  getAllSellSettings);
router.put("/edit-sellsettings/:id",  editSellSettings);
router.delete("/delete-sellsettings",  deleteSellSettings);


module.exports = router;