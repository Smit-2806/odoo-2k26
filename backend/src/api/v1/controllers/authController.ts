import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vendorbridge-key-change-in-prod';

export const register = async (req: AuthRequest, res: Response) => {
  const {
    name,
    email,
    password,
    role,
    companyName,
    taxId,
    phone,
    address,
    businessFields
  } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required fields: name, email, password, role.' }
    });
  }

  try {
    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email already registered.' }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // If role is VENDOR, create profile as transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          role,
        }
      });

      if (role === 'VENDOR') {
        if (!companyName || !taxId || !phone || !address) {
          throw new Error('Vendor profile details (companyName, taxId, phone, address) are required for VENDOR role.');
        }

        await tx.vendorProfile.create({
          data: {
            userId: newUser.id,
            companyName,
            taxId,
            phone,
            address,
            businessFields: Array.isArray(businessFields) ? businessFields.join(',') : (businessFields || 'General'),
            status: 'PENDING'
          }
        });
      }

      return newUser;
    });

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log the registration event
    await prisma.auditLog.create({
      data: {
        category: 'SYSTEM',
        message: `New user registered: ${user.name} (${user.role})`,
        user: user.name
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: { message: error.message || 'Error creating user.' }
    });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { message: 'Email and password are required.' }
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        vendorProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password.' }
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password.' }
      });
    }

    // Check if vendor profile is blocked
    if (user.role === 'VENDOR' && user.vendorProfile?.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        error: { message: 'Your vendor profile has been blocked. Please contact admin.' }
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Audit Log
    await prisma.auditLog.create({
      data: {
        category: 'SYSTEM',
        message: `User logged in: ${user.name} (${user.role})`,
        user: user.name
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Server error.' }
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Unauthorized.' }
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        vendorProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Server error.' }
    });
  }
};
