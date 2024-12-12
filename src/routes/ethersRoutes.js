const { getEthBalance } = require('../controllers/ethersController');

const router = require('express').Router();

router.post('/balance',getEthBalance);





module.exports = router;
