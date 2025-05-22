const { signup , login } = require('../Controllers/AuthController');
const ensureAuthenticated = require('../Middlewares/Auth');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');

const router = require('express').Router();

router.post('/login' , loginValidation , login);

router.get('/verify-token', ensureAuthenticated, (req, res) => {
    res.json({ success: true, message: "Token is valid", username: req.user?.username });
});

router.post('/signup' , signupValidation , signup);

module.exports = router;