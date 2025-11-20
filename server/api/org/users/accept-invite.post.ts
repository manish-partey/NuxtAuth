import { defineEventHandler, createError, readBody } from 'h3'
import User from '~/server/models/User'
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

    // Find the user with this verification token
    console.log('[accept-invite] Searching for user with token:', token.substring(0, 10) + '...')
    
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
      isVerified: false
    })

    console.log('[accept-invite] User found:', user ? 'Yes' : 'No')
    
    if (!user) {
      // Check if token exists but is expired or already used
      const expiredUser = await User.findOne({ verificationToken: token })
      
      if (expiredUser) {
        if (expiredUser.isVerified) {
          throw createError({ statusCode: 400, statusMessage: 'This invitation has already been accepted' })
        }
        if (expiredUser.verificationTokenExpiry && expiredUser.verificationTokenExpiry < new Date()) {
          throw createError({ statusCode: 400, statusMessage: 'This invitation has expired' })
        }
      }
      
      throw createError({ statusCode: 404, statusMessage: 'Invalid invitation token' })
    }

    // If accepting invitation (password provided)
    if (password) {
      if (password.length < 8) {
        throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters long' })
      }

      console.log('[accept-invite] Setting up user account')

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 12)
      
      // Update user with new password and verify them
      user.password = hashedPassword
      if (name) {
        user.name = name.trim()
      }
      user.isVerified = true
      user.verificationToken = undefined
      user.verificationTokenExpiry = undefined

      await user.save()
      console.log('[accept-invite] User account activated successfully')

      return {
        success: true,
        message: 'Invitation accepted successfully! You can now log in.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: 'Organization' // We could populate this if needed
        }
      }
    } else {
      // Just validating token without accepting (for showing invitation details)
      return {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: 'Organization' // We could populate this if needed
        }
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