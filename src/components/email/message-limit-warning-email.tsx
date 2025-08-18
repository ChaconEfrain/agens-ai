import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface Props {
  username: string;
}

export default function MessageLimitWarningEmail({
  username,
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>
          You've used 80% of your plan
        </Preview>
        <Container style={container}>
          <Img
            src='https://www.agensai.chat/chatbot-icon.png'
            width="40"
            height="40"
            alt="AgensAI"
          />

          <Text style={title}>
            <strong>{username.split(' ')[0]}</strong>, you are about to reach your plan's messages limit.
          </Text>

          <Section style={section}>
            <Text style={text}>
              Hey <strong>{username.split(' ')[0]}</strong>!
            </Text>
            <Text style={text}>
              You have used 80% of your plan's messages limit, consider upgrading to avoid having your chatbots deactivated until new billing cycle.
            </Text>

            <Button
              href='https://www.agensai.chat/pricing'
              style={{
                fontSize: '14px',
                backgroundColor: '#18181b',
                color: '#fff',
                lineHeight: 1.5,
                borderRadius: '0.5em',
                padding: '12px 24px',
              }}
              >
                Manage Subscription
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
};

const main = {
  backgroundColor: '#ffffff',
  color: '#24292e',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
};

const container = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '20px 0 48px',
};

const title = {
  fontSize: '24px',
  lineHeight: 1.25,
};

const section = {
  padding: '24px',
  border: 'solid 1px #dedede',
  borderRadius: '5px',
  textAlign: 'center' as const,
};

const text = {
  margin: '0 0 10px 0',
  textAlign: 'left' as const,
};
