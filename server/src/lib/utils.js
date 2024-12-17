import jwt from 'jsonwebtoken';

export const generateJWTToken = (userId, res) => {
    const token = jwt.sign({ userId}, process.env.JWT_SECRET, {
        expiresIn : '1d',
    })

    res.cookie("token", token, {
        maxAge : 1 * 60 * 60 * 24 * 1000,
        httpOnly : true,
        sameSite : "strict",
        secure : process.env.NODE_ENV === "production",
    });

    return token;
};
