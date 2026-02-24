import { fetchPharmaciesInstructions } from '@/services/pharmacies';
import { DosingGuideProvider } from '@/contexts/DosingGuideContext';
import { PropsWithChildren } from 'react';
import Sidebar from '@/components/DosingGuide/sidebar';
import DosingGuideLayoutClient from '@/components/DosingGuide/layoutClient';

export default async function DosingGuideLayout({ children }: Readonly<PropsWithChildren>) {
  let data = null;
  let error = null;

  try {
    data = await fetchPharmaciesInstructions();
  } catch (err) {
    error = err;
    console.error('Server-side Pharmacies Instructions API Error:', err);
  }

  return (
    <DosingGuideProvider data={data} error={error as Error | null}>
      <DosingGuideLayoutClient>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .hide-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: transparent transparent;
            }
            .hide-scrollbar:hover {
              scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
            }
            .hide-scrollbar::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            .hide-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .hide-scrollbar::-webkit-scrollbar-thumb {
              background-color: transparent;
              border-radius: 4px;
            }
            .hide-scrollbar:hover::-webkit-scrollbar-thumb {
              background-color: rgba(107, 114, 128, 0.5);
            }
            .hide-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: rgba(107, 114, 128, 0.7);
            }
          `,
          }}
        />
        <div className='tw-grid tw-grid-cols-12 pt-6-custom lg:tw-h-screen'>
          <div className='tw-col-span-12 lg:tw-col-span-3 lg:tw-h-full lg:tw-overflow-y-auto hide-scrollbar'>
            <Sidebar />
          </div>
          <div className='tw-col-span-12 lg:tw-col-span-9 tw-p-4 sm:tw-p-6 md:tw-p-10 lg:tw-pr-12 xl:tw-pr-20 lg:tw-h-full lg:tw-overflow-y-auto hide-scrollbar'>
            {children}
          </div>
        </div>
      </DosingGuideLayoutClient>
    </DosingGuideProvider>
  );
}
