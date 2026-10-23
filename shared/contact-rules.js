export function validateContactFields(values) {
  const errors = {};
  for (const [name,label,max] of [['name','Name',100],['subject','Subject',120],['message','Message',3000]]) {
    const value = String(values[name] || '').trim();
    if (!value || value.length > max) errors[name] = `${label} is required and must be at most ${max.toLocaleString()} characters.`;
    if (name !== 'message' && [...value].some(char=>char.codePointAt(0)<32||char.codePointAt(0)===127)) errors[name] = `${label} must be on a single line.`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email || '') || values.email.length > 254) errors.email = 'Enter a valid email address.';
  return errors;
}
