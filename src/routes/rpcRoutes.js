const express = require('express');
const { saveRpcUrl, deleteRpcUrl, updateRpcUrl , listRpcUrls } = require('../controllers/rpcController');

const router = express.Router();

// Route for saving an RPC URL
router.post('/save-rpc-url', saveRpcUrl);

// Route for deleting an RPC URL
router.delete('/delete-rpc-url', deleteRpcUrl);

// Route for updating an RPC URL
router.put('/update-rpc-url', updateRpcUrl);

router.post('/list-rpc-urls', listRpcUrls);


module.exports = router;
