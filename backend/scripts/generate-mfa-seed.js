import { generateSecret, generateURI } from "otplib";

const secret = generateSecret({ length: 32 });
const uri = generateURI({ issuer: "Ayush Gupta Portfolio", label: "Portfolio Admin", secret });
console.log("Store this TOTP seed in your secrets manager; do not commit it:");
console.log(secret);
console.log("Add this account to an authenticator app using the provisioning URI:");
console.log(uri);
