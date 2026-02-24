import SingleInvoice from '@/components/Dashboard/patient/invoices/SingleInvoice';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Readonly<Props>) {
  const { id = '' } = await params;
  return <SingleInvoice invoiceId={id} />;
}
