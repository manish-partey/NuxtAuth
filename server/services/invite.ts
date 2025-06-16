// server/services/invite.ts
import { getDb } from '~/server/utils/db'
import { ObjectId } from 'mongodb'

interface Invite {
  _id?: ObjectId
  email: string
  organizationId: string
  role: string
  token: string
  createdAt: Date
  expiresAt: Date
  accepted: boolean
}

export const findInviteByToken = async (token: string) => {
  const db = getDb()
  return db.collection<Invite>('invites').findOne({ token })
}

export const createInvite = async (invite: Invite) => {
  const db = getDb()
  return db.collection<Invite>('invites').insertOne(invite)
}

export const markInviteAccepted = async (token: string) => {
  const db = getDb()
  return db.collection<Invite>('invites').updateOne(
    { token },
    { $set: { accepted: true } }
  )
}

/**
 * Creates an invite and sends an email invitation.
 * @param invite - Invite details
 */
export const createAndSendInvite = async (invite: Invite) => {
  // 1. Create invite in DB
  await createInvite(invite)

  // 2. Send invite email (implement your own email sending logic here)
  // For example:
  // await sendEmail(invite.email, "You're invited!", `Use this token to accept: ${invite.token}`);

  // Placeholder - log invite creation for now
  console.log(`Invite created and sent to ${invite.email} with token ${invite.token}`)
}
