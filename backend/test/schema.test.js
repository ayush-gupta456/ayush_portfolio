import test from "node:test";
import assert from "node:assert/strict";
import { profile } from "../../src/data/profile.js";
import { contactSchema, profileSchema } from "../src/schema.js";

test("bundled portfolio document matches the strict server contract", () => {
  assert.equal(profileSchema.safeParse(profile).success, true);
});

test("portfolio profile rejects unknown fields", () => {
  assert.equal(profileSchema.safeParse({ ...profile, injected: "unexpected" }).success, false);
});

test("portfolio profile rejects non-HTTPS external links", () => {
  const candidate = structuredClone(profile);
  candidate.links.github = "javascript:alert(1)";
  assert.equal(profileSchema.safeParse(candidate).success, false);
});

test("portfolio profile applies size bounds to editable text", () => {
  const candidate = structuredClone(profile);
  candidate.name = "x".repeat(101);
  assert.equal(profileSchema.safeParse(candidate).success, false);
});

test("contact endpoint accepts bounded valid fields", () => {
  assert.equal(contactSchema.safeParse({ name: "Ayush", email: "test@example.com", subject: "Hello", message: "A short message", website: "" }).success, true);
});

test("contact endpoint rejects extra properties and oversized messages", () => {
  const valid = { name: "Ayush", email: "test@example.com", subject: "Hello", message: "A short message" };
  assert.equal(contactSchema.safeParse({ ...valid, admin: true }).success, false);
  assert.equal(contactSchema.safeParse({ ...valid, message: "x".repeat(3001) }).success, false);
});


test("portfolio rejects credential URLs and executable legacy certificate links", () => {
  const candidate=structuredClone(profile);candidate.links.github='https://user:password@github.com/example';
  assert.equal(profileSchema.safeParse(candidate).success,false);
  candidate.links.github=profile.links.github;candidate.certifications[0].image='javascript:alert(1)';
  assert.equal(profileSchema.safeParse(candidate).success,false);
});

test("contact rejects newline header injection", () => {
 assert.equal(contactSchema.safeParse({name:'Reader',email:'reader@example.com',subject:'Hello\nBcc: other@example.com',message:'A message'}).success,false);
});
