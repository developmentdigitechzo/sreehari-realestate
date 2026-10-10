import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getAllStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (db.isPostgres()) {
      const result = await db.query(
        `SELECT id, username, email, phone, role, permissions, status, password_plain, created_at FROM users ORDER BY created_at DESC`
      );

      const formatted = result.rows.map((row: any) => {
        let perms = row.permissions;
        if (typeof perms === 'string') {
          try { perms = JSON.parse(perms); } catch { perms = ['ALL']; }
        }
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          phone: row.phone || '+91 98424 01991',
          role: row.role || 'staff',
          permissions: Array.isArray(perms) ? perms : ['ALL'],
          status: row.status || 'Active',
          password_plain: row.password_plain || 'AdminPassword@2026',
          created_at: row.created_at
        };
      });

      res.json({ success: true, count: formatted.length, data: formatted });
      return;
    }

    const store = db.getFallbackData();
    const staffList = (store.users || []).map((u: any) => {
      let perms = u.permissions;
      if (typeof perms === 'string') {
        try { perms = JSON.parse(perms); } catch { perms = ['ALL']; }
      }
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone || '+91 98424 01991',
        role: u.role || 'staff',
        permissions: Array.isArray(perms) ? perms : ['ALL'],
        status: u.status || 'Active',
        password_plain: u.password_plain || 'AdminPassword@2026',
        created_at: u.created_at
      };
    });

    res.json({ success: true, count: staffList.length, data: staffList });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch staff members', error: err.message });
  }
}

export async function createStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { username, email, phone, password, role, permissions } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ success: false, message: 'Staff name, email and password are required' });
    return;
  }

  try {
    const password_hash = await bcrypt.hash(password.trim(), 10);
    const password_plain = password.trim();
    const finalPermissions = Array.isArray(permissions) && permissions.length > 0 ? permissions : ['/admin/leads'];

    const newStaff = {
      id: uuidv4(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '+91 98424 01991',
      password_hash,
      password_plain,
      role: role || 'Sales Executive',
      permissions: finalPermissions,
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      await db.query(
        `INSERT INTO users (id, username, email, phone, password_hash, password_plain, role, permissions, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11)`,
        [
          newStaff.id,
          newStaff.username,
          newStaff.email,
          newStaff.phone,
          newStaff.password_hash,
          newStaff.password_plain,
          newStaff.role,
          JSON.stringify(newStaff.permissions),
          newStaff.status,
          newStaff.created_at,
          newStaff.updated_at
        ]
      );
    }

    // Always persist in fallback DB store as well for resilience
    const store = db.getFallbackData();
    if (!store.users) store.users = [];
    const existingIdx = store.users.findIndex((u: any) => u.email.toLowerCase() === newStaff.email);
    if (existingIdx !== -1) {
      store.users[existingIdx] = newStaff;
    } else {
      store.users.push(newStaff);
    }
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'Staff user created successfully',
      data: {
        id: newStaff.id,
        username: newStaff.username,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
        permissions: newStaff.permissions,
        status: newStaff.status,
        password_plain: newStaff.password_plain
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create staff account', error: err.message });
  }
}

export async function updateStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { username, email, phone, password, role, permissions, status } = req.body;

  try {
    let finalPermissions: string[] | undefined = undefined;
    if (permissions !== undefined) {
      if (Array.isArray(permissions)) {
        finalPermissions = permissions;
      } else if (typeof permissions === 'string') {
        try {
          finalPermissions = JSON.parse(permissions);
        } catch {
          finalPermissions = [permissions];
        }
      }
    }

    if (db.isPostgres()) {
      const userRes = await db.query(`SELECT * FROM users WHERE id = $1 OR LOWER(email) = LOWER($2)`, [id, email ? email.trim() : '']);
      if (userRes.rows.length > 0) {
        const existingUser = userRes.rows[0];
        let password_hash = existingUser.password_hash;
        let password_plain = existingUser.password_plain || 'AdminPassword@2026';

        if (password && password.trim().length > 0) {
          password_hash = await bcrypt.hash(password.trim(), 10);
          password_plain = password.trim();
        }

        const updatedPermissions = finalPermissions !== undefined
          ? JSON.stringify(finalPermissions)
          : (typeof existingUser.permissions === 'string' ? existingUser.permissions : JSON.stringify(existingUser.permissions || ['ALL']));

        const updatedUser = {
          username: username !== undefined ? username.trim() : existingUser.username,
          email: email !== undefined ? email.trim().toLowerCase() : existingUser.email,
          phone: phone !== undefined ? phone.trim() : (existingUser.phone || '+91 98424 01991'),
          password_hash,
          password_plain,
          role: role !== undefined ? role.trim() : existingUser.role,
          permissions: updatedPermissions,
          status: status !== undefined ? status : existingUser.status,
          updated_at: new Date().toISOString()
        };

        await db.query(
          `UPDATE users SET username = $1, email = $2, phone = $3, password_hash = $4, password_plain = $5, role = $6, permissions = $7::jsonb, status = $8, updated_at = $9 WHERE id = $10 OR LOWER(email) = LOWER($2)`,
          [
            updatedUser.username,
            updatedUser.email,
            updatedUser.phone,
            updatedUser.password_hash,
            updatedUser.password_plain,
            updatedUser.role,
            updatedUser.permissions,
            updatedUser.status,
            updatedUser.updated_at,
            existingUser.id
          ]
        );
      }
    }

    // Always sync & persist update in fallback local DB store as well
    const store = db.getFallbackData();
    const index = (store.users || []).findIndex((u: any) => u.id === id || (email && u.email.toLowerCase() === email.trim().toLowerCase()));

    if (index !== -1) {
      const current = store.users[index];
      let newHash = current.password_hash;
      let newPlain = current.password_plain || 'AdminPassword@2026';

      if (password && password.trim().length > 0) {
        newHash = await bcrypt.hash(password.trim(), 10);
        newPlain = password.trim();
      }

      store.users[index] = {
        ...current,
        username: username !== undefined ? username.trim() : current.username,
        email: email !== undefined ? email.trim().toLowerCase() : current.email,
        phone: phone !== undefined ? phone.trim() : (current.phone || '+91 98424 01991'),
        password_hash: newHash,
        password_plain: newPlain,
        role: role !== undefined ? role.trim() : current.role,
        permissions: finalPermissions !== undefined ? finalPermissions : current.permissions,
        status: status !== undefined ? status : current.status,
        updated_at: new Date().toISOString()
      };

      db.saveFallbackData(store);

      res.json({
        success: true,
        message: 'Staff user updated successfully',
        data: store.users[index]
      });
      return;
    }

    res.json({ success: true, message: 'Staff user updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update staff user', error: err.message });
  }
}

export async function deleteStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    if (db.isPostgres()) {
      await db.query(`DELETE FROM users WHERE id = $1 AND role != 'super_admin'`, [id]);
    }

    const store = db.getFallbackData();
    const user = (store.users || []).find((u: any) => u.id === id);
    if (user && user.role === 'super_admin') {
      res.status(400).json({ success: false, message: 'Cannot delete primary Super Admin' });
      return;
    }

    store.users = (store.users || []).filter((u: any) => u.id !== id);
    db.saveFallbackData(store);
    res.json({ success: true, message: 'Staff user deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete staff user', error: err.message });
  }
}
