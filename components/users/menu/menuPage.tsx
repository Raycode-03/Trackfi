'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionsApi, menuApi, cartApi } from '@/lib/api';
import { BooksSkeleton } from '@/components/common/skeleton';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import MediaDisplay from '@/components/common/mediaDisplay';
import Loading from '@/app/loading';
interface PageProps {
  params: Promise<{ table: string }>;
}
type FilterType = 'all' | 'veg' | 'vegan';

export default function MenuPage({ params }: PageProps) {
  const paramsData = React.use(params);
  const tableNumber = Number(paramsData.table);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const ITEMS_PER_PAGE = 10;
  const queryClient = useQueryClient();

  // Start session
  const {
    isLoading: isSessionLoading,
    isSuccess: isSessionSuccess,
    isError: isSessionError,
    error: sessionError,
  } = useQuery({
    queryKey: ['session', tableNumber],
    queryFn: () => sessionsApi.startSession(tableNumber),
    enabled: Number.isFinite(tableNumber) && !sessionCreated,
    retry: false,
  });

  // Add to cart mutation - MOVED TO TOP LEVEL
  const { mutate: addToCart, isPending: isAddingToCart } = useMutation({
    mutationFn: (menuId: string) => cartApi.addCart(menuId),
    onMutate: () => {
      toast.loading('Adding to cart...', { id: 'cart-toast' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', tableNumber] });
      toast.success('Added to cart!', { id: 'cart-toast' });
    },
    onError: (error: Error) => {
      toast.error('Failed to add item', { id: 'cart-toast', description: error.message });
    },
  });

  // Handle cart click
  const handleCart = (menuId: string) => {
    if (isAddingToCart) return;
    addToCart(menuId);
  };

  useEffect(() => {
    if (isSessionSuccess && !sessionCreated) {
      setSessionCreated(true);
      toast.success('Session started', {
        description: `Welcome to Table ${tableNumber}`,
      });
    }
  }, [isSessionSuccess, sessionCreated, tableNumber]);

  useEffect(() => {
    if (!isSessionError || !(sessionError instanceof Error)) return;

    if (
      !navigator.onLine ||
      sessionError.message === 'NETWORK_ERROR' ||
      sessionError.message.includes('Failed to fetch')
    ) {
      toast.error('Connection issue', {
        description: 'Poor internet connection. Please check your network.',
        duration: 1000,
      });
      return;
    }

    toast.error('Failed to create session', {
      description: sessionError.message,
    });
  }, [isSessionError, sessionError]);

  // Menu query
  const {
    data: menusResponse,
    isLoading: isMenuLoading,
    error: menuError,
  } = useQuery({
    queryKey: ['menus', page],
    queryFn: () => menuApi.getMenus(page, ITEMS_PER_PAGE),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (menuError instanceof Error) {
      toast.error('Failed to load menus', {
        description: menuError.message,
      });
    }
  }, [menuError]);
  // Pull out menus array and total from response
  const menus = menusResponse?.data ?? [];
  const total = menusResponse?.total ?? 0;

  const hasMore = (page + 1) * ITEMS_PER_PAGE < total;
  const prevPage = () => setPage((old) => Math.max(old - 1, 0));
  const nextPage = () => setPage((old) => old + 1);

  const filteredMenus = menus.filter((menu) => {
    if (!menu.is_available) return false;

    // Filter logic
    if (filter === 'veg' && !menu.is_veg) return false;
    if (filter === 'vegan' && !menu.is_vegan) return false;

    // Search filter
    if (search.trim() !== '') {
      const query = search.toLowerCase();
      return (
        menu.name?.toLowerCase().includes(query) ||
        menu.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      {/* Session loader */}
      {isSessionLoading && <Loading />}

      {/* Menu loader */}
      {isMenuLoading && !isSessionLoading && <BooksSkeleton />}

      {/* Menu error */}
      {menuError && (
        <div className="text-red-500 text-center mt-6">Failed to load menus</div>
      )}

      {!isSessionLoading && !isMenuLoading && (
        <div className="flex items-center justify-between w-full mb-4 gap-4 flex-wrap">
          {/* LEFT: Filters */}
          <div className="flex gap-3 flex-wrap">
            {(['all', 'veg', 'vegan'] as FilterType[]).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          {/* RIGHT: Search */}
          <div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 p-2 border rounded-md"
              placeholder="Search menu items..."
            />
          </div>
        </div>
      )}


      {/* Menu grid */}
      {!isSessionLoading && !isMenuLoading && menus.length > 0 && (
        <>
          <div className="w-full max-w-7xl mx-auto grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            {filteredMenus.map((menu) => (
              <div
                key={menu._id}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg"
              >
                <MediaDisplay
                  video_url={menu.video_url}
                  image_url={menu.image_url}
                  alt={menu.name}
                />

                <CardContent className="p-4 space-y-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold line-clamp-1">{menu.name}</h3>
                    <p className="hidden md:block text-lg font-bold text-blue-600 shrink-0">
                      ₦{menu.price.toLocaleString()}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {menu.description}
                  </p>

                  <p className="md:hidden text-lg font-bold text-blue-600">
                    ₦{menu.price.toLocaleString()}
                  </p>
                </CardContent>

                <CardFooter className="p-4 pt-0 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-10 cursor-pointer"
                    onClick={() => handleCart(menu._id)}
                    disabled={isAddingToCart}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </CardFooter>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button size="sm" onClick={prevPage} disabled={page === 0}
              className='cursor-pointer'>
              Prev
            </Button>
            <span>Page {page + 1}</span>
            <Button
              size="sm"
              onClick={nextPage}
              disabled={!hasMore}
              className='cursor-pointer'
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}