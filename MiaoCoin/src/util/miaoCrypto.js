const {
  createHash,
  randomBytes,
  generateKeyPairSync,
  createSign,
  randomInt,
  randomUUID,
  createVerify,
  getCurves,
} = require("crypto");

class MiaoCrypto {
  /**
   * description : 打印库信息
   */
  static info() {
    console.log(getCurves())
  }
  /**
   *
   * @param {string} data utf8 encoded
   * @returns {string} hash
   */
  static hash(data) {
    const hash = createHash("sha256").update(data).digest("hex");
    return hash;
  }

  /**
   *
   * @returns {string} random UUID
   */
  static randomId() {
    return randomUUID();
  }

  /**
   *
   * @param {string} privateKey pem encoded
   * @param {string} data utf8 encoded
   * @returns {string}
   */
  static sign(privateKey, data) {
    const signer = createSign("SHA256");
    signer.update(data).end(); // 提供签名数据并结束输入
    return signer.sign(privateKey, "hex");
  }

  /**
   *
   * @param {string} publicKey ,pem encoded
   * @param {string} signature ,hex string
   * @param {boolean}
   * @returns
   */
  static verify(publicKey, signature, data) {
    
    const verifier = createVerify("SHA256");
    verifier.update(data).end(); // 提供验证数据并结束输入
    return verifier.verify(publicKey, signature, "hex");
  }

  /**
   * 
   * @returns {string,string} {privateKey, publicKey} / pem encoded 
   */
  static generateKeyPair() {
    const { privateKey, publicKey } = generateKeyPairSync("ec", {
      namedCurve: "prime256v1", // 和 elliptic 库中的曲线相同
      publicKeyEncoding: {
        type: "spki", // 编码格式
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
    return { privateKey, publicKey };
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
// ( () => {
//   const { publicKey, privateKey } =  MiaoCrypto.generateKeyPair();
//   console.log(`generateKeyPair pub:${publicKey} priv: ${privateKey}`);

//   const data = "Hello, world!";
//   const signature =  MiaoCrypto.sign(privateKey, data);
//   console.log(`signature: ${signature}`);

//   const isVerified =  MiaoCrypto.verify(publicKey, signature, data);
//   console.log(`verify: ${isVerified}`);

//   const pubHex =  MiaoCrypto.pemToHex(publicKey);
//   console.log(`pubHex: ${pubHex}`);

// })();

module.exports = MiaoCrypto;
