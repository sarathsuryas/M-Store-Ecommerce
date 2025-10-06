console.log('--- Environment Variable Debug ---');

console.log('PORT:', process.env.PORT ? 'Set' : 'Not Set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('EMAIL:', process.env.email ? 'Set' : 'Not Set');
console.log('PASSWORD:', process.env.password ? 'Set' : 'Not Set');
console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? 'Set' : 'Not Set');
console.log('RAZORPAY_KEY_ID:', process.env.razorpay_key_id ? 'Set' : 'Not Set');
console.log('RAZORPAY_KEY_SECRET:', process.env.razorpay_key_secret ? 'Set' : 'Not Set');

console.log('--- End Debug ---');
