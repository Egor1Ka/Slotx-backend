import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId:              { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    creemSubscriptionId: { type: String },
    creemEventId:        { type: String, required: true, unique: true },
    productId:           { type: String, required: true },
    type:                { type: String, required: true, enum: ["subscription", "one_time"] },
    eventType:           { type: String, required: true },
    amount:              { type: Number },
    currency:            { type: String },
    creemPayload:        { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

paymentSchema.index({ userId: 1, type: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
