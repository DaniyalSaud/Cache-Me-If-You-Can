# Order Workflow Documentation

## Overview
This document describes the complete order workflow with admin approval requirements, cancellation rules, and revenue tracking.

---

## Order Status Flow

```
pending → [admin approves] → processing → shipped → completed
                ↓
          [admin can cancel before shipping]
```

---

## Key Features

### 1. **Admin Approval Required**
- **Rule**: Admin must approve orders before farmers can accept them
- **Implementation**: 
  - New field `adminApproved` in Order model (default: false)
  - New endpoint: `POST /api/v/orders/:id/approve` (admin only)
  - Farmers see "⏳ Awaiting Admin Approval" badge on pending orders
  - Accept button only appears after admin approval

### 2. **Cancellation Rules**
- **Who Can Cancel**: Only admins
- **When**: Only before order is shipped
- **Restrictions**:
  - Cannot cancel orders with status: `shipped`, `delivered`, or `completed`
  - Cannot cancel already cancelled orders
  - Farmers cannot accept cancelled orders
- **Implementation**:
  - Updated `refundOrder` function with shipping status check
  - New fields: `cancelledAt`, `cancelledBy`, `cancellationReason`

### 3. **Revenue Calculation**
- **Rule**: Revenue only counted after order is shipped
- **Previous Logic**: `status === "completed" && paymentStatus === "paid"`
- **New Logic**: `(status === "shipped" || status === "completed") && paymentStatus === "paid"`
- **Why**: Ensures farmers see revenue as soon as they ship products

---

## Order Model Updates

### New Fields Added
```javascript
{
  adminApproved: Boolean (default: false),
  adminApprovedAt: Date,
  adminApprovedBy: ObjectId (ref: User),
  acceptedAt: Date,
  shippedAt: Date,
  cancelledAt: Date,
  cancelledBy: ObjectId (ref: User),
  cancellationReason: String
}
```

---

## API Endpoints

### 1. Approve Order (Admin Only)
**Endpoint**: `POST /api/v/orders/:id/approve`  
**Auth**: Admin only  
**Purpose**: Admin approves order so farmer can accept it

**Request**:
```javascript
// No body required
```

**Response**:
```javascript
{
  "statusCode": 200,
  "message": "Order Approved Successfully",
  "data": { /* updated order */ }
}
```

**Error Cases**:
- 403: Only admins can approve orders
- 400: Cannot approve cancelled order
- 400: Order already approved
- 404: Order not found

---

### 2. Accept/Ship Order (Seller/Admin)
**Endpoint**: `POST /api/v/orders/:id/release`  
**Auth**: Seller or Admin  
**Purpose**: 
- First call: Accept order (pending → processing)
- Second call: Mark as shipped (processing → shipped)

**New Validation**:
- Farmers: Requires admin approval before accepting
- Cannot accept cancelled orders
- Admins can bypass approval requirement

**Request**:
```javascript
// No body required
```

**Response**:
```javascript
{
  "statusCode": 200,
  "message": "Order Accepted Successfully", // or "Order Shipped Successfully"
  "data": { /* updated order */ }
}
```

**Error Cases**:
- 403: Order must be approved by admin (for sellers)
- 403: Not authorized to accept this order
- 400: Cannot accept cancelled order
- 400: Order already completed
- 404: Order not found

---

### 3. Cancel/Refund Order (Admin Only)
**Endpoint**: `POST /api/v/orders/:id/refund`  
**Auth**: Admin only  
**Purpose**: Cancel order and issue refund

**New Restrictions**:
- Only admin can cancel (previously seller could too)
- Cannot cancel after shipping
- Automatically sets paymentStatus to "refunded"

**Request**:
```javascript
{
  "reason": "Customer requested cancellation" // optional
}
```

**Response**:
```javascript
{
  "statusCode": 200,
  "message": "Order Cancelled and Refunded Successfully",
  "data": { /* updated order */ }
}
```

**Error Cases**:
- 403: Only admin can cancel orders
- 400: Cannot cancel after shipping
- 400: Order already cancelled
- 404: Order not found

---

## Frontend Changes

### Farmer Dashboard Updates

#### 1. Order Type Definition
Added `adminApproved: boolean` field to Order type

#### 2. Order Header Display
Shows admin approval status for pending orders:
- ✓ Admin Approved (green badge)
- ⏳ Awaiting Admin Approval (orange badge)

#### 3. Accept Order Button Logic
```typescript
// Check if cancelled
if (order.status === 'cancelled') {
  alert('❌ Cannot accept a cancelled order');
  return;
}

// Check admin approval (for sellers only)
if (userRole === 'seller' && !order.adminApproved) {
  alert('⚠️ This order must be approved by admin before you can accept it');
  return;
}
```

#### 4. Action Buttons UI
- **Pending Orders**:
  - If not admin approved: Shows "⏳ Waiting for admin approval" (disabled)
  - If admin approved: Shows "✅ Accept Order" button
- **Processing Orders**: Shows "📦 Mark as Shipped" button
- **Cancelled Orders**: Shows "❌ Order Cancelled" (disabled)

---

## Workflow Examples

### Example 1: Normal Order Flow (Happy Path)
1. **Buyer** creates order → Status: `pending`, adminApproved: `false`
2. **Admin** approves order → adminApproved: `true`
3. **Farmer** accepts order → Status: `processing`, acceptedAt: `<timestamp>`
4. **Farmer** ships order → Status: `shipped`, shippedAt: `<timestamp>`
5. **Revenue** added to farmer's total
6. **Buyer** marks received → Status: `completed`

### Example 2: Admin Cancels Order
1. **Buyer** creates order → Status: `pending`
2. **Admin** reviews and decides to cancel
3. **Admin** cancels → Status: `cancelled`, paymentStatus: `refunded`
4. **Farmer** sees "❌ Order Cancelled" (cannot accept)

### Example 3: Farmer Tries to Accept Without Approval
1. **Buyer** creates order → Status: `pending`, adminApproved: `false`
2. **Farmer** clicks "Accept Order"
3. **Frontend** shows alert: "⚠️ This order must be approved by admin"
4. **Backend** returns 403 if somehow bypassed frontend check

### Example 4: Admin Cannot Cancel After Shipping
1. Order status: `shipped`
2. **Admin** tries to cancel
3. **Backend** returns 400: "Cannot cancel order after it has been shipped"

---

## Revenue Calculation

### Old Logic
```javascript
totalRevenue = orders
  .filter(o => o.paymentStatus === "paid" && o.status === "completed")
  .reduce(/* sum amounts */)
```

### New Logic
```javascript
totalRevenue = orders
  .filter(o => o.paymentStatus === "paid" && 
              (o.status === "shipped" || o.status === "completed"))
  .reduce(/* sum amounts */)
```

### Why Changed?
- Farmers should see revenue immediately after shipping
- No need to wait for buyer to confirm delivery
- Payment is already held in escrow, so it's guaranteed

---

## Audit Logging

All actions are logged in the AuditLog collection:

### Order Approved
```javascript
{
  OrderId: orderId,
  userId: adminId,
  action: "Order Approved by Admin",
  amount: order.totalAmount,
  details: "Admin approved order, farmer can now accept it"
}
```

### Order Accepted
```javascript
{
  OrderId: orderId,
  userId: farmerId,
  action: "Order Accepted",
  amount: order.totalAmount,
  details: "Order status changed to processing"
}
```

### Order Shipped
```javascript
{
  OrderId: orderId,
  userId: farmerId,
  action: "Order Shipped",
  amount: order.totalAmount,
  details: "Order status changed to shipped"
}
```

### Order Cancelled
```javascript
{
  OrderId: orderId,
  userId: adminId,
  action: "Order Cancelled",
  amount: order.totalAmount,
  details: reason || "Cancelled by admin"
}
```

---

## Testing Checklist

### Backend
- [ ] Admin can approve pending orders
- [ ] Farmer cannot accept without admin approval
- [ ] Farmer can accept after admin approval
- [ ] Admin can bypass approval requirement
- [ ] Admin can cancel before shipping
- [ ] Admin cannot cancel after shipping
- [ ] Farmer cannot accept cancelled orders
- [ ] Revenue counts shipped orders
- [ ] Audit logs created for all actions

### Frontend
- [ ] Admin approval badge shows correctly
- [ ] Accept button disabled without approval
- [ ] Accept button enabled after approval
- [ ] Cancelled orders show disabled state
- [ ] Revenue updates after shipping
- [ ] Error messages show for invalid actions

---

## Security Considerations

1. **Authorization Checks**:
   - Admin approval endpoint requires admin role
   - Cancel endpoint requires admin role (previously allowed sellers)
   - Accept endpoint checks seller ownership or admin role

2. **Order Status Validation**:
   - Cannot accept cancelled orders
   - Cannot cancel shipped/completed orders
   - Cannot re-approve already approved orders

3. **Audit Trail**:
   - All actions logged with userId and timestamp
   - Cancellation reason recorded
   - Admin who approved/cancelled is tracked

---

## Migration Notes

### For Existing Orders
Existing orders in database may not have new fields. Default behaviors:
- `adminApproved`: `false` (will need admin approval if still pending)
- `acceptedAt`, `shippedAt`, `cancelledAt`: `undefined`

### Recommended Migration Script
```javascript
// Run this to auto-approve existing pending orders (optional)
db.orders.updateMany(
  { status: "pending", adminApproved: { $exists: false } },
  { $set: { adminApproved: true, adminApprovedAt: new Date() } }
);
```

---

## Future Enhancements

### Potential Improvements
1. **Auto-approval for trusted farmers**: After X successful orders
2. **Approval notifications**: Email/SMS to admin when new orders arrive
3. **Cancellation reasons**: Dropdown with predefined reasons
4. **Partial cancellations**: Cancel individual products, not entire order
5. **Farmer appeal**: Allow farmer to request admin reconsideration
6. **Time limits**: Auto-cancel if not approved within X hours

---

## Support

For questions or issues related to the order workflow:
- Check audit logs for action history
- Verify order status and adminApproved field
- Ensure user roles are correctly assigned
- Review error messages in API responses

---

**Last Updated**: November 2, 2025  
**Version**: 2.0  
**Status**: Active ✅
