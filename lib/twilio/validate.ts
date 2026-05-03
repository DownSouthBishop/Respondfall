import crypto from 'crypto';

export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.warn('TWILIO_AUTH_TOKEN not set — skipping signature validation');
    return false;
  }

  const sortedParams = Object.keys(params)
    .sort()
    .reduce((str, key) => str + key + params[key], url);

  const hmac = crypto.createHmac('sha1', authToken);
  hmac.update(sortedParams);
  const expected = hmac.digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
