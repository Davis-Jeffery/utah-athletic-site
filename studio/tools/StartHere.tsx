// "Start here": the screen the Studio opens on. The jobs editors do most, as big buttons, plus what
// needs attention (new form messages). Each button opens the right document or list directly.
import { useEffect, useState, type ReactNode } from 'react';
import { useClient, useCurrentUser, useWorkspace } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Badge, Box, Card, Flex, Heading, Stack, Text } from '@sanity/ui';

type Counts = { messages: number; paid: number };

export function StartHere() {
  const client = useClient({ apiVersion: '2025-10-01' });
  const user = useCurrentUser();
  const { basePath } = useWorkspace();
  const at = (path: string) => `${basePath.replace(/\/$/, '')}/${path}`;
  const [n, setN] = useState<Counts | null>(null);
  useEffect(() => {
    client.fetch<Counts>('{ "messages": count(*[_type == "submission" && status == "new"]), "paid": count(*[_type == "futuresRegistration" && payment == "paid"]) }')
      .then(setN).catch(() => setN(null));
  }, [client]);

  return (
    <Box padding={[4, 5, 6]} style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Stack gap={5}>
        <Stack gap={3}>
          <Heading size={4}>Hi{user?.name ? ` ${user.name.split(' ')[0]}` : ''}, what would you like to do?</Heading>
          <Text muted>Pick a task, or use <b>Structure</b> at the top to browse everything by website page.</Text>
        </Stack>

        <Section title="Needs attention">
          <Tile href={at('structure/messages;new')} title="New form messages" note="Contact forms, trial requests and sign-ups to answer"
            badge={n ? String(n.messages) : undefined} tone={n?.messages ? 'caution' : 'default'} />
          <Tile href={at('registrations')} title="Registrations" note="Players by age group and gender, and group emails"
            badge={n ? `${n.paid} paid` : undefined} />
        </Section>

        <Section title="Post dates">
          <Tile intent={{ intent: 'create', params: { type: 'tryoutSession', template: 'tryout-academy' } }} title="Add an Academy tryout" note="Date, time, field and age groups" />
          <Tile intent={{ intent: 'create', params: { type: 'tryoutSession', template: 'tryout-club' } }} title="Add a Club tryout" note="Date, time, field and age groups" />
          <Tile intent={{ intent: 'create', params: { type: 'recSession' } }} title="Add a Recreation session" note="Season dates, registration and price" />
          <Tile intent={{ intent: 'create', params: { type: 'futuresSession' } }} title="Add a Futures session" note="Classes, spots and price" />
          <Tile intent={{ intent: 'create', params: { type: 'event' } }} title="Add a tournament or event" note="Dates, link, logo and colors" />
        </Section>

        <Section title="Edit the website">
          <Tile intent={{ intent: 'edit', params: { id: 'pageHome', type: 'pageHome' } }} title="Home page" note="Every home page section, in order" />
          <Tile href={at('structure/academy')} title="A program page" note="Academy, Club, Recreation or Futures" />
          <Tile href={at('structure/staff')} title="Staff" note="Names, titles, emails and headshots" />
          <Tile intent={{ intent: 'edit', params: { id: 'siteSettings', type: 'siteSettings' } }} title="Site settings" note="Main email, header button, social links" />
        </Section>
      </Stack>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap={3}>
      <Text size={1} weight="semibold" muted style={{ textTransform: 'uppercase', letterSpacing: '.08em' }}>{title}</Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>{children}</div>
    </Stack>
  );
}

function Tile({ title, note, href, intent, badge, tone = 'default' }: {
  title: string; note: string; href?: string; intent?: { intent: string; params: Record<string, string> };
  badge?: string; tone?: 'default' | 'caution';
}) {
  const body = (
    <Card padding={4} radius={3} border tone={tone} style={{ height: '100%', cursor: 'pointer' }}>
      <Stack gap={3}>
        <Flex justify="space-between" align="center" gap={2}>
          <Text weight="semibold">{title}</Text>
          {badge ? <Badge tone={tone === 'caution' ? 'caution' : 'primary'}>{badge}</Badge> : null}
        </Flex>
        <Text size={1} muted>{note}</Text>
      </Stack>
    </Card>
  );
  const style = { textDecoration: 'none', color: 'inherit', display: 'block' };
  return intent
    ? <IntentLink intent={intent.intent} params={intent.params} style={style}>{body}</IntentLink>
    : <a href={href} style={style}>{body}</a>;
}
