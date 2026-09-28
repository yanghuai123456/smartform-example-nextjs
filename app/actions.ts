'use server';

export async function submitContact(formData: FormData) {
  const endpoint = process.env.SMARTFORM_ENDPOINT || 'https://api.usesmartform.com';
  const formId   = process.env.SMARTFORM_FORM_ID;
  if (!formId) throw new Error('SMARTFORM_FORM_ID is not set');

  const r = await fetch(`${endpoint}/api/v1/f/${formId}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(Object.fromEntries(formData)),
    cache:   'no-store',
  });

  const body = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(body.message || `SmartForm returned ${r.status}`);
  }
  return body;   // { success, message, submission_id, is_spam, intent, next_url }
}
