const express = require('express');
const router = express.Router();

const lightningRouter = require('./lightningRouter');
const solanaRouter = require('./solanaRouter');
const projectSettingsRouter = require('./projectSettingsRouter');
const walletSettingsRouter = require('./walletSettingsRouter');
const settingsRouter = require('./settingsRouter');
const timeIntervalRouter = require('./timeIntervalRouter');
const metaDataRouter = require('./metaDataRouter');

router.use("/core", lightningRouter);
router.use("/settings", settingsRouter);
router.use("/timeinterval", timeIntervalRouter);
router.use("/walletsettings", walletSettingsRouter);
router.use("/projectsettings", projectSettingsRouter);
router.use("/", solanaRouter);
router.use("/metadata", metaDataRouter);


module.exports = router;
