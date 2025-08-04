import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  // Define your schema fields here
  name: { type: String, required: true },
  description: { type: String },
  // Add other fields as needed
});

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

export default Service;