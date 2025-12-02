import User from '~/server/models/User'
import Invite from '../../../models/Invite'
import Organization from '../../../models/Organization'
import bcryptjs from 'bcryptjs'
import { connectToDatabase } from '~/server/utils/db'



// Removed redundant implementation of defineEventHandler
