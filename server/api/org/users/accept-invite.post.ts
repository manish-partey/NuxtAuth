import { defineEventHandler, createError, readBody } from 'h3'
import User from '~/server/models/User'
import Invite from '../../../models/Invite'
import Organization from '../../../models/Organization'
import bcryptjs from 'bcryptjs'
import { connectToDatabase } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const body = await readBody(event)
    const { token, password, name } = body

    console.log('[accept-invite] Received request:', { token: token ? 'present' : 'missing', password: password ? 'present' : 'missing' })

    if (!token) {
      throw createError({ statusCode: 400, statusMessage: 'Invitation token is required' })
    }

    if (!password) {
      throw createError({ statusCode: 400, statusMessage: 'Password is required' })
    }

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Name is required' })
    }

    if (password.length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters long' })
    }

    // Find the invite by token
    console.log('[accept-invite] Searching for invite with token:', token.substring(0, 10) + '...')
    
    const invite = await Invite.findOne({ 
      token,
      status: 'pending',
      revoked: { $ne: true },
      expiresAt: { $gt: new Date() }
    }).populate('organizationId', 'name');

    if (!invite) {
      // Check for expired or used invites to provide better error messages
      const expiredInvite = await Invite.findOne({ token });
      
      if (expiredInvite) {
        if (expiredInvite.status === 'accepted') {
          throw createError({ statusCode: 400, statusMessage: 'This invitation has already been accepted' })
        }
        if (expiredInvite.revoked) {
          throw createError({ statusCode: 400, statusMessage: 'This invitation has been revoked' })
        }
        if (expiredInvite.expiresAt < new Date()) {
          throw createError({ statusCode: 400, statusMessage: 'This invitation has expired' })
        }
      }
      
      throw createError({ statusCode: 404, statusMessage: 'Invalid invitation token' })
    }

    console.log('[accept-invite] Invite found for email:', invite.email)

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: 'A user with this email already exists. Please use the login page.' 
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12)
    
    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: invite.email,
      password: hashedPassword,
      role: invite.role,
      organizationId: invite.organizationId,
      isVerified: true // Auto-verify since they're accepting an invite
    });

    await newUser.save();
    console.log('[accept-invite] New user created:', newUser.email)

    // Mark the invite as accepted
    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();

    console.log('[accept-invite] Invite marked as accepted')

    return {
      success: true,
      message: 'Invitation accepted successfully! You can now log in.',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organizationId: newUser.organizationId,
        organization: (invite.organizationId as any)?.name || 'Organization'
      }
    }

  } catch (error: any) {
    console.error('[org/users/accept-invite.post] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to accept invitation',
      data: error.message
    })
  }
})