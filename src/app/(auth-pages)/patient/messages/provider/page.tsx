import ProviderChat from '@/components/Dashboard/patient/messages/ProviderChat';

interface ProviderChatProps {
  searchParams?: Promise<{ title?: string; type?: string }>;
}

export default async function ProviderChatPage({ searchParams }: Readonly<ProviderChatProps>) {
  const { title, type } = (await searchParams) || {};

  return <ProviderChat title={title} type={type} />;
}
