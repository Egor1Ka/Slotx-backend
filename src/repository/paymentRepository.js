import Payment from "../models/Payment.js";
import billingDto from "../dto/billingDto.js";

const createPayment = async (data) => {
  const doc = await Payment.create(data);
  return billingDto.paymentToDTO(doc);
};

const getPaymentsByUserId = async (userId, limit = 50) => {
  const docs = await Payment.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
  return docs.map(billingDto.paymentToDTO);
};

const hasOneTimePurchase = async (userId, productId) => {
  return await Payment.exists({ userId, productId, type: "one_time" });
};

const getOneTimePurchasesByUserId = async (userId) => {
  const docs = await Payment.find({ userId, type: "one_time" });
  return docs.map(billingDto.paymentToDTO);
};

export default {
  createPayment,
  getPaymentsByUserId,
  hasOneTimePurchase,
  getOneTimePurchasesByUserId,
};
