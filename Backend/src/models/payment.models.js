import mongoose, {Schema} from 'mongoose';

const paymentSchema = new Schema({
    amount: {type: Number, required: true},
    currency: {type: String, required: true},
    method: {type: String, required: true},
    status: {type: String, required: true, enum: ['pending', 'completed', 'failed','refunded']},
    orderId: {type: Schema.Types.ObjectId, ref: 'Order', required: true},
    transactionId: {type: String, required: true, unique: true}, // Easypaisa Transaction IDs
}, {timestamps: true});

export const Payment = mongoose.model('Payment', paymentSchema);