const { generateKeyPairSync } = require("crypto");
const pool = require("../config/db");
const generateAndStoreKeyPair = async () => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + 3);

  console.log("Private Key (base64) : " + privateKey);
  console.log("Public Key (base64) : " + publicKey);

  await pool.query(
    "INSERT INTO signing_keys (private_key,public_key,expires_at) VALUES($1,$2,$3)",
    [privateKey, publicKey, expirationDate]
  );
  return { privateKey, publicKey };
};
const getActiveKeyPair = async () => {
  const result = await pool.query(
    "SELECT private_key,public_key FROM signing_keys WHERE expires_at > NOW() LIMIT 1"
  );
  console.log(result);

  if (result.rows.length > 0) {
    return {
      privateKey: Buffer.from(result.rows[0].private_key),
      publicKey: Buffer.from(result.rows[0].public_key),
    };
  }
  return null;
};

const getKeyPair = async () => {
  let keyPair = await getActiveKeyPair();

  if (!keyPair) {
    keyPair = await generateAndStoreKeyPair();
  }
  return keyPair;
};
module.exports = { getKeyPair };
