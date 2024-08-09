// MyCrypto
class MyCrypto {
  static async hash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    return MyCrypto.bufferToHex(hashBuffer);
  }

  static randomId(size = 64) {
    const array = new Uint8Array(size / 2);
    crypto.getRandomValues(array);
    return MyCrypto.bufferToHex(array);
  }

  // private key pem
  /**
   *
   * @param {*} data
   * @param {} privateKey
   * @returns {string} der hex string
   */
  static async sign(data, privateKey) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const key = await MyCrypto.importPrivateKey(privateKey);

    var signature = await crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      },
      key,
      dataBuffer
    );
    signature = MyCrypto.convertP1363ToDER(signature);
    signature = MyCrypto.bufferToHex(signature);
    return signature;
  }
  static async verify(data, signature, publicKey) {
    // Convert the message to an ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Convert the PEM-formatted public key to ArrayBuffer
    const keyData = MyCrypto.pemToBuffer(publicKey);

    const publicKeyin = await crypto.subtle.importKey(
      "spki",
      keyData,
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["verify"]
    );

    // Convert the signature from hex to ArrayBuffer
    var signatureBuffer = MyCrypto.hexToArrayBuffer(signature);
    signatureBuffer = MyCrypto.convertDERToP1363(signatureBuffer)
    // Verify the signature
    const isValid = await crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      },
      publicKeyin,
      signatureBuffer,
      dataBuffer
    );
    // console.log(`Verify result: ${isValid}, data: ${data} , signature: ${signature}, pubkey: ${publicKey}`)
    return isValid;
  }

  static async generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );
    const privateKey = await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );
    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    return {
      privateKey: MyCrypto.bufferToPem(privateKey, "PRIVATE KEY"),
      publicKey: MyCrypto.bufferToPem(publicKey, "PUBLIC KEY"),
    };
  }
  static hexToArrayBuffer(hex) {
    // 计算字节数（每两个hex字符代表一个字节）
    const length = hex.length / 2;
    // 创建 Uint8Array 来存储转换后的字节
    const arrayBuffer = new Uint8Array(length);
    // 遍历 hex 字符串，每两个字符解析为一个字节
    for (let i = 0; i < length; i++) {
      const byteValue = parseInt(hex.substr(i * 2, 2), 16);
      arrayBuffer[i] = byteValue;
    }
    // 返回 ArrayBuffer
    return arrayBuffer.buffer;
  }
  static async importPrivateKey(pem) {
    const keyBuffer = MyCrypto.pemToBuffer(pem);
    var importKey = "";
    try {
      importKey = await crypto.subtle.importKey(
        "pkcs8",
        keyBuffer,
        {
          name: "ECDSA",
          namedCurve: "P-256",
        },
        true,
        ["sign"]
      );
    } catch (error) {
      console.log(error);
    }
    console.log("importKey result:", importKey);
    return importKey;
  }

  static pemToHex(pem) {
    const keyBuffer = MyCrypto.pemToBuffer(pem);
    return MyCrypto.bufferToHex(keyBuffer);
  }

  static pemToBuffer(pem) {
    const stripped = pem
      .replace(/-----BEGIN .*-----/, "")
      .replace(/-----END .*-----/, "")
      .replace(/\s/g, "");
    // 将 Base64 编码的内容解码为 Buffer
    return Uint8Array.from(atob(stripped), (c) => c.charCodeAt(0));
  }

  /**
   *
   * @param {ArrayBuffer} buffer
   * @returns {string} hex encoded string
   */
  static bufferToHex(buffer) {
    const byteArray = new Uint8Array(buffer);
    const hexParts = [];

    byteArray.forEach((byte) => {
      const hex = byte.toString(16).padStart(2, "0");
      hexParts.push(hex);
    });

    return hexParts.join("");
  }

  static bufferToPem(buffer, label) {
    const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const pemString = `-----BEGIN ${label}-----\n${base64String}\n-----END ${label}-----`;
    return pemString;
  }

  /**
   * P-256 IEEE P1363 格式 签名转换
   * @param {Buffer} p1363Signature
   * @returns {Uint8Array} 
   */
  static convertP1363ToDER(p1363Signature) {
    const p1363Array = new Uint8Array(p1363Signature);
    const r = p1363Array.slice(0, p1363Array.length / 2);
    const s = p1363Array.slice(p1363Array.length / 2);

    const rDer = MyCrypto.integerToDER(r);
    const sDer = MyCrypto.integerToDER(s);

    // DER encoded SEQUENCE: 0x30 + length of rDer + sDer + rDer + sDer
    const derSignature = new Uint8Array([
      0x30,
      rDer.length + sDer.length,
      ...rDer,
      ...sDer,
    ]);

    // console.log(`before : ${p1363Signature} , after : ${derSignature}`);
    return derSignature;
  }

  static integerToDER(integerArray) {
    // Remove leading zeros
    let i = 0;
    while (i < integerArray.length && integerArray[i] === 0) i++;
    const integer = integerArray.slice(i);

    // If the first byte >= 0x80, prepend 0x00 to indicate positive number
    if (integer[0] >= 0x80) {
      return new Uint8Array([0x02, integer.length + 1, 0x00, ...integer]);
    }
    return new Uint8Array([0x02, integer.length, ...integer]);
  }

  static convertDERToP1363(derSignature) {
    const derArray = new Uint8Array(derSignature);

    if (derArray[0] !== 0x30) throw new Error("Invalid DER signature format");

    let offset = 2; // 跳过 SEQUENCE 和长度
    const rLen = derArray[offset + 1];
    const r = derArray.slice(offset + 2, offset + 2 + rLen);
    offset += 2 + rLen;

    const sLen = derArray[offset + 1];
    const s = derArray.slice(offset + 2, offset + 2 + sLen);

    const p1363Signature = new Uint8Array(64);
    p1363Signature.set(r, 32 - r.length);
    p1363Signature.set(s, 64 - s.length);

    return p1363Signature;
  }
}

// 使用示例
// (async () => {
//   // 生成散列
//   const hash = await MyCrypto.hash("Hello, world!");
//   console.log("Hash:", hash);

//   // 生成随机ID
//   const randomId = MyCrypto.randomId();
//   console.log("Random ID:", randomId);

//   // 生成密钥对
//   const { privateKey, publicKey } = await MyCrypto.generateKeyPair();
//   console.log("Private Key:", MyCrypto.pemToHex(privateKey));
//   console.log("Public Key:", publicKey);

//   // 签名数据
//   const signature = await MyCrypto.sign("Hello, world!", privateKey);
//   console.log("Signature:", signature);

//   // PEM转Hex
//   const hex = MyCrypto.pemToHex(privateKey);
//   console.log("PEM to Hex:", hex);
// })();

export default MyCrypto;
