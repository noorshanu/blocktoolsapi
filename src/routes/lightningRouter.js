const router = require('express').Router();
const multer = require('multer');

// const { addNewNetwork, addRpc, addWallets, addRouterAdress, createProject } = require("../controllers/lightningController");
//const { addNewNetwork } = require("../admin/controllers/admNetworksController");

const {
  addNewNetwork,
  editNetwork,
  deleteNetwork,
  listNetworks,
} = require('../controllers/networksController');



const {
  createProject,
  editProject,
  deleteProject,
  listProjects,
} = require('../controllers/projectContoller');

const {   addRpc,
  editRpc,
  deleteRpc,
  listRpc, } = require('../controllers/li_RpcController');
const {   getAllWallets,
  addWallets,
  listAllWallets, } = require('../controllers/walletsController');
const { addRouterAdress, editRouterAddress, deleteRouterAddress, listRouterAddress } = require('../controllers/addressContorller');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/users');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        '-' +
        uniqueSuffix +
        '.' +
        file.originalname.split('.')[1]
    );
  },
});

const upload = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowed.includes(file.originalname.split('.')[1])) {
      return cb(new Error('Please upload jpg, jpeg, webp, or png'));
    }
    cb(undefined, true);
  },
  storage: storage,
});

//network
router.post(
  '/create-network',
  
  upload.single('networkLogo'),
  addNewNetwork
);
router.put(
  '/edit-network/:id',
  
  upload.single('networkLogo'),
  editNetwork
);
router.delete('/delete-network',  deleteNetwork);
router.post('/list-networks',  listNetworks);

//rpc
router.post('/add-rpc',  addRpc);
router.put('/edit-rpc/:id',  editRpc);
router.delete('/delete-rpc/:id',  deleteRpc);
router.post('/list-rpc',  listRpc);

//wallets
router.post('/create-wallets',  addWallets);
router.post('/list-wallets',  listAllWallets);

//routeraddress
router.post('/create-routerAddress',  addRouterAdress);
router.put('/edit-routerAddress/:id',  editRouterAddress);
router.delete('/delete-routerAddress/:id',  deleteRouterAddress);
router.post('/list-routerAddress',  listRouterAddress);

//projects
router.post(
  '/create-project',
  
  upload.single('tokenImage'),
  createProject
);
router.put(
  '/edit-project/:id',
  
  upload.single('tokenImage'),
  editProject
);
router.delete('/delete-project/:id',  deleteProject);
router.post('/list-projects',  listProjects);

module.exports = router;
