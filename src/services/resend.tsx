import MessageLimitWarningEmail from '@/components/email/message-limit-warning-email';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMessageLimitEmail({to, name}: {to: string; name: string}) {
  await resend.emails.send({
    from: 'AgensAI <efrain.chacon@agensai.chat>',
    to,
    replyTo: 'efrain.chacon@agensai.chat',
    subject: 'Message limit heads up',
    react: <MessageLimitWarningEmail username={name} />,
  });
}