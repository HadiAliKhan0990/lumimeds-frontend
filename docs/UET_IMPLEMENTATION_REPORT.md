# Microsoft UET Implementation Report

## 📅 **Implementation Date**

**Today** - The Microsoft UET implementation was completed and deployed today.

## 🎯 **Exact Event Names for Conversion Actions**

Your client needs to create these **exact** conversion actions in Microsoft Advertising:

### **1. Add to Cart**

- **Event Name**: `add_to_cart`
- **Triggered When**: User selects a product plan on homepage
- **Location**: `components/Home/ProductsPlans/index.tsx`
- **Function**: `microsoftTrackAddToCart(itemId, itemName, value, currency)`

### **2. Begin Checkout**

- **Event Name**: `begin_checkout`
- **Triggered When**: User starts the patient intake survey
- **Location**: `components/Survey/PatientIntakeSurvey/includes/QuestionairreForm.tsx`
- **Function**: `microsoftTrackInitiateCheckout(value, currency, items)`

### **3. Purchase**

- **Event Name**: `Purchase`
- **Triggered When**: User completes checkout successfully
- **Location**: `app/checkout/success/page.tsx` and `components/Checkout/CheckoutForm.tsx`
- **Function**: `microsoftTrackPurchase(transactionId, value, currency, items)`

### **4. Submit Lead Form**

- **Event Name**: `submit_lead_form`
- **Triggered When**: User completes the patient intake survey
- **Location**: `components/Survey/PatientIntakeSurvey/includes/QuestionairreForm.tsx`
- **Function**: `microsoftTrackFormSubmission(formName, leadValue)`

## 🔧 **UET Tag Configuration**

### **Tag ID**: `187214916`

### **Script URL**: `https://bat.bing.com/bat.js`

### **Implementation**: Next.js App Router with robust fallback mechanisms

## 🚨 **Troubleshooting UET Inactive Status**

### **Possible Causes:**

1. **Script Loading Issues**

   - The UET script may be blocked by ad blockers in development
   - Network connectivity issues to `bat.bing.com`
   - Browser security settings blocking external scripts

2. **Tag ID Issues**

   - Verify the tag ID `187214916` is correct in Microsoft Advertising
   - Ensure the tag is active in your Microsoft Advertising account

3. **Environment Issues**
   - Development environment may have different behavior than production
   - Ad blockers commonly block tracking scripts in development

### **Debugging Steps:**

1. **Check Browser Console**

   ```javascript
   // Run this in browser console to check UET status
   console.log('UET Status:', {
     loaded: typeof window.uetq !== 'undefined',
     tagId: window.uetq ? '187214916' : 'Not loaded',
     queueLength: window.uetq ? window.uetq.length : 0,
   });
   ```

2. **Test Event Firing**

   ```javascript
   // Test if events are being tracked
   window.uetq.push('event', 'Purchase', {
     revenue_value: 149.99,
     currency: 'USD',
     transaction_id: 'test-order-123',
     items: [
       {
         id: 'test-product',
         name: 'Test Product',
         price: 149.99,
         quantity: 1,
       },
     ],
   });
   ```

3. **Check Network Tab**
   - Look for requests to `bat.bing.com`
   - Check for any blocked requests (red entries)

### **Production vs Development**

- **Development**: Scripts may be blocked by ad blockers
- **Production**: Should work normally without ad blockers
- **Fallback**: System includes manual initialization if external script fails

## 📊 **Event Data Structure**

Each event includes the following data structures:

### **Add to Cart Event**

```javascript
window.uetq.push('event', 'add_to_cart', {
  revenue_value: value,
  currency: 'USD',
  items: [
    {
      id: itemId,
      name: itemName,
      price: value,
      quantity: 1,
    },
  ],
});
```

### **Begin Checkout Event**

```javascript
window.uetq.push('event', 'begin_checkout', {
  revenue_value: value,
  currency: 'USD',
  items: items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity || 1,
  })),
});
```

### **Purchase Event**

```javascript
window.uetq.push('event', 'Purchase', {
  revenue_value: value,
  currency: 'USD',
  transaction_id: transactionId,
  items: items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity || 1,
  })),
});
```

### **Submit Lead Form Event**

```javascript
window.uetq.push('event', 'submit_lead_form', {
  event_label: formName,
  revenue_value: leadValue,
  currency: 'USD',
});
```

## ✅ **Verification Checklist**

- [ ] UET Tag ID `187214916` is correct
- [ ] Script loads from `https://bat.bing.com/bat.js`
- [ ] Events fire with correct names: `add_to_cart`, `begin_checkout`, `Purchase`, `submit_lead_form`
- [ ] No JavaScript errors in console
- [ ] Network requests to Microsoft servers are not blocked
- [ ] Production environment testing (without ad blockers)

## 🔄 **Next Steps**

1. **Verify Tag ID** in Microsoft Advertising dashboard
2. **Test in Production** environment (without ad blockers)
3. **Create Conversion Actions** with exact event names listed above
4. **Monitor Data** for 24-48 hours after production deployment
5. **Check Network Tab** for successful requests to `bat.bing.com`

## 📞 **Support**

If issues persist:

1. Check Microsoft Advertising UET Tag Helper browser extension
2. Verify tag is active in Microsoft Advertising account
3. Test in incognito/private browsing mode
4. Check for any firewall or network restrictions
