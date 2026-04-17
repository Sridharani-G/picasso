import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
        role: string;
    };
}

/**
 * Strict Authentication Middleware
 * Fails the request if no valid token is provided.
 */
export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No valid bearer token provided.'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'art-community-secret-key-2026'
        ) as AuthRequest['user'];

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

/**
 * Optional Authentication Middleware
 * Parses token if it exists, otherwise allows the request to proceed as an anonymous user.
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'art-community-secret-key-2026'
            ) as AuthRequest['user'];

            req.user = decoded;
        }
        next();
    } catch (error) {
        next();
    }
};
