export function isSafeReference(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

export function resourcePostIssue(data) {
  if (data.category !== 'Posts') return data.body.trim().length >= 100 ? null : 'Notes need at least 100 characters.';
  if (!data.resourceUrl) return null;
  if (!isSafeReference(data.resourceUrl)) return 'Use a full HTTPS resource URL without a username or password.';
  const { hostname } = new URL(data.resourceUrl);
  if (['video', 'channel'].includes(data.resourceType) && !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(hostname)) return 'Choose a YouTube URL for videos and channels.';
  if (data.resourceType === 'repository' && !['github.com', 'www.github.com'].includes(hostname)) return 'Choose a github.com URL for repositories.';
  return null;
}

export function validateNoteFields(data) {
  const errors = {};
  for (const [field, label, min, max] of [['author','Your name',2,80],['title','Title',5,160],['summary','Summary',20,400],['body','Explanation',data.category === 'Posts' ? 20 : 100,30000]]) {
    const length = (data[field] || '').trim().length;
    if (length < min || length > max) errors[field] = `${label} must contain ${min}–${max.toLocaleString()} characters.`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '') || data.email.length > 254) errors.email = 'Enter a valid email address.';
  if (!['Engineering','Web','Data','Cloud','Tech','Posts'].includes(data.category)) errors.category = 'Choose a category.';
  if ((data.topic || '').length > 100) errors.topic = 'Use at most 100 characters for the topic.';
  const issue = resourcePostIssue({...data, body:data.body || ''});
  if (issue && !errors.body) errors.resourceUrl = issue;
  if ((data.resourceUrl || '').length > 2000) errors.resourceUrl = 'Use a resource URL with at most 2,000 characters.';
  if (data.links.length > 5 || data.links.some(link => link.length > 2000 || !isSafeReference(link))) errors.links = 'Add up to five full HTTPS links without embedded login details.';
  if (!data.consent) errors.consent = 'Agree to editorial review and publication before submitting.';
  return errors;
}
