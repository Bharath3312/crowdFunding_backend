import { SignJWT, jwtVerify } from "jose";
import { Users } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Generate JWT Token
 */
export const generateJWT = async (payload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
};

/**
 * Verify JWT Token
 */
export const verifyJWT = async (token) => {
  const { payload } = await jwtVerify(token, secret);

  return payload;
};


export const validateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const payload = await verifyJWT(token);
    const userData = await Users.findOne({_id : payload.user_id}).lean();
    
    if(!userData) throw new Error();
    req.user = {...userData,user_id : payload.user_id};
    // console.log(req.user,"userData");

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};