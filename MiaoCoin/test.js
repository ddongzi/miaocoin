


const crypto = require('crypto');

// Given public key
const publicKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEYYRPUAi/AFWimXgZSinoWYdh2NjY
geGTKl/BXCRQJFshvfun6WhA/Bq/pQh1CTZp3REyCiGy3A3yaIV9rlzqQg==
-----END PUBLIC KEY-----`;

// Data to be verified
const data = 'c8d2b38fd4a7655fbcb922bdfc6d988aa4b5cd139395e1d6d10243307ed76a66';

// Signature to verify
const signature = '4778444973fa5c14aca5e365d68ff74e42e85890cf869e6f5fe3580ad443757c1339c71410e365a5b009794cc3c58f54492f3eebfe4688e9e8810f9451384ff0';

// Create a verifier object
const verify = crypto.createVerify('SHA256');

// Update the verifier with the data
verify.update(Buffer.from(data, 'hex'));

// Verify the signature
const isValid = verify.verify(publicKey, Buffer.from(signature, 'hex'));

console.log('Is the signature valid?', isValid);
