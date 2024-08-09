const crypto = require('crypto');

function verifySignatureNodeJS(data, publicKeyPEM, derSignature) {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();

    const isVerified = verify.verify(publicKeyPEM, Buffer.from(derSignature, 'hex'));
    console.log("Signature Verified:", isVerified);
}

// 使用从前端得到的数据进行验证
const data = "Hello, this is a test message!";
const publicKeyPEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEO1pdyG9QJbM9GYAjFVS8cPcK4HKG
5rdWxz7YtO6A/snZ4Vgp7oEQLUaS/MyX9sIcRt/31WmM0gCybZhluXfLmA==
-----END PUBLIC KEY-----`;

const derSignature = "304502200456f4fbf450101489b17101cc1b216386ed01f37c4a51cdbbacd16904658f67022100fbf64e62e97b010b40b9f572bd4f4392c39c4309fa0f2c5f7e2d3767fda56cb2";

// 验证签名
verifySignatureNodeJS(data, publicKeyPEM, derSignature);
