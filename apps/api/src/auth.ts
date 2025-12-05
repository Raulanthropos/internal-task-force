import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const APP_SECRET = process.env.JWT_SECRET || 'appsecret321';

export function signToken(userId: string, role: string, team: string | null) {
    return jwt.sign({ userId, role, team }, APP_SECRET);
}

export function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

export function getUser(token: string) {
    if (token) {
        try {
            return jwt.verify(token, APP_SECRET);
        } catch (e) {
            return null;
        }
    }
    return null;
}
