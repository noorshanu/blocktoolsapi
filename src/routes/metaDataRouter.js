const router = require("express").Router();


const { createMetadata } = require("../controllers/metaDataController");


router.post("/create",  createMetadata);




module.exports = router;
