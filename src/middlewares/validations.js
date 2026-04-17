const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validateEmailMiddleware = (req, res, next) => {
    const { email } = req.body;
    if (!email || !validateEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    next();
};  

module.exports = { validateEmail, validateEmailMiddleware };