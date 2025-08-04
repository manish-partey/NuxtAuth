import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISubscription extends Document {
  tenantId: string
  // Add other fields as needed, for example:
  // plan: string
  // startDate: Date
  // endDate: Date
}

const SubscriptionSchema: Schema = new Schema({
  tenantId: { type: String, required: true },
  // Add other fields here
  // plan: { type: String },
  // startDate: { type: Date },
  // endDate: { type: Date },
})

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema)

  export default Subscription