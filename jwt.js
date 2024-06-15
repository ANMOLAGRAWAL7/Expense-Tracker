import jwt from "jsonwebtoken";
const jwt_secret = "anmol123";

const jwtAuthMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) return res.status(401).json({ error: 'Unauthorized' });
    try{
        // Verify the JWT token
        const decoded = jwt.verify(token, jwt_secret);
        // Attach user information to the request object
        req.user = decoded
        next();
    }catch(err){
        console.error(err);
        res.status(401).json({ error: 'Invalid token' });
    }
}
// Function to generate JWT token
const generateToken = (userData) => {
    // Generate a new JWT token using user data
    return jwt.sign(userData, jwt_secret, {expiresIn: 3000});
}
export { jwtAuthMiddleware, generateToken };
