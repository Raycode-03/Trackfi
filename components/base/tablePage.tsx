'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, QrCode, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { landingTablesApi } from '@/lib/api';
import { useNetworkError } from '@/hooks/useNetworkError';

type TableStatus = 'available' | 'active';

interface Table {
  id: number;
  number: string;
  status: string;
}

interface TablesResponse {
  tables: Table[];
}

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    dot: 'bg-gray-300',
    card: 'border-gray-200 bg-white hover:border-[#16A34A]/40 hover:shadow-md cursor-pointer',
    text: 'text-gray-400',
  },
   active: {
    label: 'Active',
    dot: 'bg-red-500 animate-pulse',
    card: 'border-red-200 bg-red-50 opacity-70 cursor-not-allowed',
    text: 'text-gray-500',
  },
};

const normalizeStatus = (status: string): TableStatus => {
  switch (status.toLowerCase()) {
    case 'available':
    case 'vacant':
      return 'available';

    case 'active':
      return 'active';

    default:
      return 'available';
  }
};

export default function TablesPage() {

  const [selected, setSelected] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useQuery<TablesResponse>({
    queryKey: ['tables'],
    queryFn: () => landingTablesApi.getTables(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useNetworkError(!!isError, error, 'Failed to load tables');

  useEffect(() => {
    if (!error) return;

    if (error instanceof Error) {
      toast.error('Failed to load tables', {
        description: error.message,
      });
    }
  }, [error]);

  const tables = data?.tables || [];

  const selectedTable = tables.find(t => t.id === selected);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Image
            src="/logos/Spinner.svg"
            alt="Loading animation"
            width={100}
            height={100}
            priority
          />
          <p className="text-gray-600">Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}

      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4">

        <div className="max-w-2xl mx-auto flex items-center gap-3">

          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>

          <div>
            <h1 className="text-base font-bold text-gray-900">
              Choose Your Table
            </h1>

            <p className="text-xs text-gray-400">
              Tap your table number to start ordering
            </p>
          </div>

        </div>

      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Legend */}

        <div className="flex items-center gap-4 mb-6">

          {Object.entries(STATUS_CONFIG).map(([status, config]) => (

            <div key={status} className="flex items-center gap-1.5">

              <span className={`w-2 h-2 rounded-full ${config.dot}`} />

              <span className="text-xs text-gray-500 capitalize">
                {config.label}
              </span>

            </div>

          ))}

        </div>

        {/* Tables Grid */}

        <div className="grid grid-cols-3 gap-3 mb-8">

          {tables.map((table) => {

            const normalizedStatus = normalizeStatus(table.status);

            const config = STATUS_CONFIG[normalizedStatus];

            const isActive = normalizedStatus === 'active';

            const isSelected = selected === table.id;

            if (isActive) {

              return (

                <div
                  key={table.id}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 p-5 ${config.card}`}
                >

                  <span className={`text-2xl font-black ${config.text}`}>
                    {table.number}
                  </span>

                  <div className="flex items-center gap-1 mt-1">

                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />

                    <span className={`text-[10px] font-medium ${config.text}`}>
                      {config.label}
                    </span>

                  </div>

                </div>

              );

            }

            return (

              <button
                key={table.id}
                onClick={() => setSelected(table.id)}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all duration-200
                ${config.card}
                ${isSelected ? 'ring-2 ring-[#16A34A] ring-offset-2' : ''}
                `}
              >

                <span className="text-2xl font-black text-gray-800">
                  {table.number}
                </span>

                <div className="flex items-center gap-1 mt-1">

                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />

                  <span className={`text-[10px] font-medium ${config.text}`}>
                    {config.label}
                  </span>

                </div>

              </button>

            );

          })}

        </div>

        {/* Selected Table CTA */}

        {selectedTable && (

          <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto">

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-4 flex items-center gap-4">

              <div className="bg-gray-900 rounded-xl p-3 shrink-0">

                <QrCode className="w-8 h-8 text-white" />

              </div>

              <div className="flex-1">

                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Selected
                </p>

                <p className="text-sm font-bold text-gray-900">
                  Table {selectedTable.number}
                </p>

              </div>

              <Link
                href={`/menu/${selectedTable.number}`}
                className="flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                Order Now
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}