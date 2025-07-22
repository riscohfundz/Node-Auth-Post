import express from 'express' ;

const router = express.Router();

// route for login
router.get('/login', (req, res) => {
    res.render("login", { title: 'Login-page' });
});

// route for register
router.get('/register', (req, res) => {
    res.render("register", { title: 'register-page' });
});


// route for forgot-password
router.get('/forgot-password', (req, res) => {
    res.render("forgot-password", { title: 'forgot-password-page' });
});
export default router;
 