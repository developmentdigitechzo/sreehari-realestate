import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'sree_hari_realty_secret_jwt_token_2026_secured';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  try {
    let user: any = null;

    if (db.isPostgres()) {
      const result = await db.query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email.trim()]);
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    } else {
      const store = db.getFallbackData();
      user = store.users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    if (user.status && user.status.toLowerCase() === 'disabled') {
      res.status(403).json({ success: false, message: 'Account is disabled. Contact Admin.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let parsedPermissions = user.permissions;
    if (typeof parsedPermissions === 'string') {
      try {
        parsedPermissions = JSON.parse(parsedPermissions);
      } catch {
        parsedPermissions = ['ALL'];
      }
    }
    if (!parsedPermissions || !Array.isArray(parsedPermissions)) {
      parsedPermissions = ['ALL'];
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: parsedPermissions
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    let user: any = null;

    if (db.isPostgres()) {
      const result = await db.query(`SELECT * FROM users WHERE id = $1 OR LOWER(email) = LOWER($2)`, [req.user.id, req.user.email]);
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    } else {
      const store = db.getFallbackData();
      user = store.users.find((u: any) => u.id === req.user?.id || u.email.toLowerCase() === req.user?.email.toLowerCase());
    }

    if (!user) {
      // Fallback for default admin
      res.json({
        success: true,
        user: {
          id: 'admin-01',
          username: 'admin',
          email: 'admin@sreeharirealty.com',
          role: 'super_admin',
          permissions: ['ALL']
        }
      });
      return;
    }

    let parsedPermissions = user.permissions;
    if (typeof parsedPermissions === 'string') {
      try {
        parsedPermissions = JSON.parse(parsedPermissions);
      } catch {
        parsedPermissions = ['ALL'];
      }
    }
    if (!parsedPermissions || !Array.isArray(parsedPermissions)) {
      parsedPermissions = ['ALL'];
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: parsedPermissions
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: err.message });
  }
}
