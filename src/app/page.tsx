'use client';

import { Web3Zone } from "./components/web3Zone";
import { AuthHeader } from "./components/AuthHeader";
import Link from 'next/link';
import { useUser } from "@civic/auth-web3/react";
import { useEffect, useState } from 'react';

const Page = () => {
  const { user, isLoading } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="z-10 flex h-full flex-col p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Civic Auth Web3 NextJS</h1>

        <AuthHeader />

        <Web3Zone />

        {user && !isLoading && (
          <Link 
            href="/events" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Events
          </Link>
        )}

        <footer className="absolute bottom-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>©2025 Civic Technologies, Inc. All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Page;
