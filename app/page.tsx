'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import IFCViewer from './components/IFCViewer';
import Header from '@/app/components/Header';

// Dynamically import Monaco editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('./components/MonacoEditor'), {
  ssr: false
});

export default function Home() {


  return (
    <main>
      <div className="flex text-[var(--text_main)] bg-[var(--base)] z-10">
        <div className="relative max-w-full px-2">
          <Header /> 
        </div>
      </div>
      <div id="body-container-id">
        <div className="full-screen" id="three-container-id">
          <IFCViewer />
        </div>
      </div>
      {/*}
      <DocLayout>
        <MonacoEditor value={code} onChange={setCode} />
      </DocLayout>
      */} 
    </main>
  );
}
