const { randomUUID } = require("crypto");

const { subtle } = require("crypto").webcrypto;

class MiaoCrypto {
  /**
   *
   * @param {string} data utf8 encoded
   * @param {AlgorithmIdentifier} algorithm
   * @returns {Promise} resolves: {ArrayBuffer}
   */
  static async hash(data, algorithm = "SHA-256") {
    const dataBuffer = MiaoCrypto.stringToArrayBuffer(data);
    const encoder = new TextEncoder();
    const hash = await subtle.digest(algorithm, encoder.encode(dataBuffer));
    return hash;
  }

  static randomId() {
    return randomUUID();
  }

  /**
   *
   * @param {CryptoKey} key
   * @param {ArrayBuffer} data
   * @returns
   */
  static async sign(key, data) {
    const ec = new TextEncoder();
    const signature = await subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      ec.encode(data)
    );
    return signature;
  }
  /**
   *
   * @param {CryptoKey} key
   * @param {ArrayBuffer} signature
   * @param {ArrayBuffer} data
   * @returns {Promise} resolves: {boolean}
   */
  static async verify(key, signature, data) {
    const ec = new TextEncoder();
    const verified = await subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      signature,
      ec.encode(data)
    );
    return verified;
  }
  /**
   *
   * @returns {Object}
   * @returns {CryptoKey} Object.privateKey {CryptoKey}
   * @returns {CryptoKey} Object.publicKey {CryptoKey}
   */
  static async generateKeyPair() {
    const { publicKey, privateKey } = await subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );

    return { publicKey, privateKey };
  }
  /**
   *
   * @param {CryptoKey} key private key
   * @returns {string} pem
   */
  static async exportPrivateKey(key) {
    const privateKeyBuffer = await subtle.exportKey("pkcs8", key);
    const privateKey64 = MiaoCrypto.arrayBufferToBase64(privateKeyBuffer);
    const privateKeyPem = MiaoCrypto.base64ToPem(privateKey64, "PRIVATE KEY");
    return privateKeyPem;
  }
  /**
   *
   * @param {CryptoKey} key public key
   * @returns {string} base64 encoded private key
   */
  static async exportPublicKey(key) {
    // 现代web交互居多
    const publicKeyBuffer = await subtle.exportKey("spki", key);
    const publicKey64 = MiaoCrypto.arrayBufferToBase64(publicKeyBuffer);
    const publicKeyPem = MiaoCrypto.base64ToPem(publicKey64, "PUBLIC KEY");
    return publicKeyPem;
  }
  /**
   *
   * @param {string} key base64 encoded
   * @returns {Promise} resolves ：{CryptoKey}
   */
  static async importPublicKey(key) {
    const publicKeyBuffer = MyCrypto.base64ToArrayBuffer(key);
    const publicKey = await subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["verify"]
    );
    return publicKey;
  }
  /**
   *
   * @param {ArrayBuffer} buffer
   * @returns {string} hex string
   */
  static arrayBufferToHex(buffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
      .join("");
  }
  /**
   *
   * @param {ArrayBuffer} buffer
   * @returns {string} base64 encoded string
   */
  static arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   *
   * @param {ArrayBuffer} buffer
   * @returns {Uint8Array}
   */
  static arrayBufferToUint8Array(buffer) {
    return new Uint8Array(buffer);
  }

  /**
   *
   * @param {string} str
   * @returns {ArrayBuffer} buffer
   */
  static stringToArrayBuffer(str) {
    // 创建一个 Uint8Array 实例，它的缓冲区是 ArrayBuffer
    const encoder = new TextEncoder(); // TextEncoder 将字符串编码为 UTF-8
    return encoder.encode(str).buffer; // 返回 ArrayBuffer
  }
  /**
   *
   * @param {string} base64
   * @returns {ArrayBuffer}
   */
  static base64ToArrayBuffer(base64) {
    // 使用 atob() 解码 Base64 编码的字符串
    const binaryString = window.atob(base64);
    // 创建一个 Uint8Array，长度与解码后的二进制数据相同
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    // 将每个字符的 ASCII 值赋给 Uint8Array
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    // 返回 ArrayBuffer
    return bytes.buffer;
  }
  /**
   *
   * @param {string} hex
   * @returns {ArrayBuffer}
   */
  static hexToArrayBuffer(hex) {
    // 去掉可能的空格
    hex = hex.replace(/\s/g, "");
    // 创建一个 Uint8Array，长度为 Hex 字符串的一半
    const len = hex.length / 2;
    const bytes = new Uint8Array(len);
    // 将 Hex 字符串中的每对字符转换为一个字节
    for (let i = 0; i < len; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    // 返回 ArrayBuffer
    return bytes.buffer;
  }
  /**
   * Converts a Base64 string to a Hex string.
   * @param {string} base64 - The Base64 encoded string.
   * @returns {string} - The Hexadecimal representation of the input.
   */
  static base64ToHex(base64) {
    // Decode the Base64 string to binary string
    const binaryString = Buffer.from(base64, "base64").toString("binary");

    // Convert binary string to hex string
    let hex = "";
    for (let i = 0; i < binaryString.length; i++) {
      const hexChar = binaryString.charCodeAt(i).toString(16);
      hex += (hexChar.length === 1 ? "0" : "") + hexChar; // Ensures each byte is two hex characters
    }
    return hex;
  }
  /**
   * 将 Base64 编码的数据转换为 PEM 格式
   * @param {string} base64Data - Base64 编码的密钥或证书数据
   * @param {string} type - 数据类型，例如 "PUBLIC KEY" 或 "PRIVATE KEY"
   * @returns {string} - PEM 格式的数据
   */
  static base64ToPem(base64Data, type) {
    // 添加标头和标尾
    const header = `-----BEGIN ${type}-----\n`;
    const footer = `\n-----END ${type}-----`;

    // 每64字符插入一个换行符
    const pemData = base64Data.match(/.{1,64}/g).join("\n");

    // 拼接成完整的PEM格式
    return header + pemData + footer;
  }
  /**
   * 将 PEM 格式的数据转换为 Base64 编码
   * @param {string} pemData - PEM 格式的数据
   * @returns {string} - Base64 编码的数据
   */
  static pemToBase64(pemData) {
    // 去掉PEM的标头和标尾
    const base64Data = pemData
      .replace(/-----BEGIN [A-Z ]+-----/, "") // 移除BEGIN部分
      .replace(/-----END [A-Z ]+-----/, "") // 移除END部分
      .replace(/\s+/g, ""); // 移除所有空格和换行符

    return base64Data;
  }

  /**
   * 
   * @param {string} pem 
   * @returns {string} hex
   */
  static pemToHex(pem) {
    const base64Pem = MiaoCrypto.pemToBase64(pem);
    return MiaoCrypto.base64ToHex(base64Pem);
  }
}
// (async () => {
//   const { publicKey, privateKey } = await MiaoCrypto.generateKeyPair();
//   console.log(`generateKeyPair pub:${publicKey} priv: ${privateKey}`);
//   const privateKeyPem = await MiaoCrypto.exportPrivateKey(privateKey);
//   console.log(privateKeyPem);
//   const publicKeyPem = await MiaoCrypto.exportPublicKey(publicKey);
//   console.log(publicKeyPem);

//   const data = "Hello, world!";
//   const dataBuffer = MiaoCrypto.stringToArrayBuffer(data);
//   const signBuffer = await MiaoCrypto.sign(privateKey, dataBuffer);
//   const signBase64 = MiaoCrypto.arrayBufferToBase64(signBuffer);
//   console.log(`sign: ${signBase64}`);

//   const isVerified = await MiaoCrypto.verify(publicKey, signBuffer, dataBuffer);
//   console.log(`verify: ${isVerified}`);
// })();

module.exports = MiaoCrypto;
