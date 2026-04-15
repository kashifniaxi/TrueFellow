import { Token } from 'graphql';
import jwt from 'jsonwebtoken';

export const generateToken = (user) =>{
    return jwt.sign(
        {id : user._id, role : user.role},
        process.env.JWT_SECRET,
        {expiresIn : '1d'}
    );
};

export const refreshToken = (user) =>{
    return jwt.sign(
        {id : user._id},
        process.env.JWT_REFRESH_SECRET,
        {expiresIn : '7d'}
    );
};

export const verifyToken = (Token, secret) => {
    console.log("Verifying Token:", Token, 'with secrete', secret); // Debugging line
    return jwt.verify(Token, secret);
};