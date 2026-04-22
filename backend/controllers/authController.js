import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ensureDemoDataForUser } from '../services/demoSeedService.js';

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const ensureAdminUser = async () => {
  let adminUser = await User.findOne({ role: 'admin' });

  if (adminUser) {
    return adminUser;
  }

  // Create a fallback admin identity so password-only admin login has a valid account context.
  const seedPassword = await bcrypt.hash(`system_admin_${Date.now()}`, 10);
  adminUser = await User.create({
    name: 'System Admin',
    email: `system-admin-${Date.now()}@smartagri.local`,
    password: seedPassword,
    role: 'admin',
  });

  return adminUser;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const requestedRole = req.body.role === 'admin' ? 'admin' : 'user';
    let role = 'user';

    if (requestedRole === 'admin') {
      if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'Admin registration is not allowed' });
      }

      role = 'admin';
    }

    // Hash passwords before saving to avoid storing plain text credentials.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await ensureDemoDataForUser(user);

    const token = generateToken(user._id, user.role || 'user');

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register user' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const resolvedRole = user.role || 'user';
    await ensureDemoDataForUser(user);
    const token = generateToken(user._id, resolvedRole);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: resolvedRole,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        ...user.toObject(),
        role: user.role || 'user',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ message: 'At least one field is required to update profile' });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
      if (existingEmailUser) {
        return res.status(409).json({ message: 'Email is already registered' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) {
      user.name = name.trim();
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch {
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch {
    return res.status(500).json({ message: 'Failed to change password' });
  }
};

export const adminPasswordLogin = async (req, res) => {
  try {
    const { adminAccessPassword } = req.body;
    const adminPassword = process.env.ADMIN_LOGIN_PASSWORD || process.env.ADMIN_SECRET;

    if (!adminPassword) {
      return res.status(500).json({ message: 'Admin login password is not configured' });
    }

    if (!adminAccessPassword) {
      return res.status(400).json({ message: 'Admin access password is required' });
    }

    if (adminAccessPassword !== adminPassword) {
      return res.status(403).json({ message: 'Invalid admin access password' });
    }

    const adminUser = await ensureAdminUser();
    const token = generateToken(adminUser._id, 'admin');

    return res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'admin',
      },
    });
  } catch {
    return res.status(500).json({ message: 'Failed to login as admin' });
  }
};
