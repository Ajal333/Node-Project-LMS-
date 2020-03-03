const express = require('express');
const router = express.Router();

const user_controller = require("../controller/userlist.controller");

router.get('/', user_controller.view_usersbook);
router.get('/:username', user_controller.view_usersbook_label);

module.exports = router;