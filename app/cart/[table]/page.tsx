'use client';
import React, { useState , useEffect} from 'react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi , orderApi} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import MediaDisplay from '@/components/menu/mediaDisplay';
import { CartItem } from '@/types';
import { useRouter } from 'next/navigation';
import { CartSkeleton } from '@/components/dashboard/skeleton';
interface PageProps {
  params: Promise<{ table: string }>;
}

function CartPage({ params }: PageProps) {
  const paramsData = React.use(params);
  const tableNumber = Number(paramsData.table);
  const queryClient = useQueryClient();

  // Track which item is being modified
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();
  
  const {
    data: cart = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['cart', tableNumber],
    queryFn: () => cartApi.getCart(),
    staleTime: 0,
    retry: 1,
  });
  useEffect(() => {
  if (!error) return;
  if (error instanceof Error && error.message === 'Session expired') {
    toast.error('Session not found', {
      description: 'Your session has ended. Refreshing...',
      duration: 3000,
    });
    setTimeout(() => router.replace(`/menu/${tableNumber}`), 2000);
  }
}, [error, router, tableNumber]);

  const { mutate: removeFromCart } = useMutation({
    mutationFn: (cartItemId: string) => cartApi.removeFromCart(cartItemId),
    onMutate: (cartItemId) => {
      setRemovingId(cartItemId);
      toast.loading('Removing item...', { id: 'remove-toast' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed', { id: 'remove-toast' });
    },
    onError: (error: Error) => {
      toast.error('Failed to remove item', { id: 'remove-toast', description: error.message });
    },
    onSettled: () => setRemovingId(null),
  });

  const { mutate: updateQuantity } = useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      cartApi.updateCartItem(cartItemId, quantity),
    onMutate: ({ cartItemId }) => {
      setUpdatingId(cartItemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update quantity', { description: error.message });
    },
    onSettled: () => setUpdatingId(null),
  });
  // redirects to payment platform
  const { mutate: placeOrder, isPending: isPlacingOrder } = useMutation({
    mutationFn: () => orderApi.createCheckout(tableNumber),
    onMutate: () => {
      toast.loading('Redirecting to payment...', { id: 'order-toast' });
    },
    onSuccess: (data) => {
      toast.dismiss('order-toast');
      window.location.href = data.url; // redirect to Stripe
    },
    onError: (error: Error) => {
      toast.error('Failed to start checkout', { id: 'order-toast', description: error.message });
    },
  });

  const total = cart.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0
  );

  if (isLoading) return <CartSkeleton />;
  
    if (error) {
  // if session expired, show nothing — useEffect is handling the redirect
  if (error instanceof Error && error.message === 'Session expired') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Session ended. Redirecting...</p>
        </div>
      </div>
    );
  }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load cart</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 p-6">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-600">Your cart is empty</h2>
        <p className="text-sm text-gray-400">Add items from the menu to get started</p>
        <Link href={`/menu/${tableNumber}`} >
          <Button className='bg-[#16A34A] hover:bg-[#15803D]'>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 pb-40">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="flex flex-col gap-4">
        {cart.map((item: CartItem) => {
          const isItemRemoving = removingId === item._id;
          const isItemUpdating = updatingId === item._id;
          const isItemBusy = isItemRemoving || isItemUpdating;

          return (
            <div
              key={item._id}
              className={`flex items-center gap-4 bg-white rounded-2xl border p-4 shadow-sm transition-opacity duration-200 ${
                isItemRemoving ? 'opacity-40 pointer-events-none' : 'opacity-100'
              }`}
            >
              {/* Media */}
              {(item.image_url || item.video_url) && (
                <MediaDisplay
                  image_url={item.image_url}
                  video_url={item.video_url}
                  alt={item.name}
                  className="h-16 w-16 rounded-xl shrink-0"
                />
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                <p className="text-blue-600 font-bold text-sm mt-0.5">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  ₦{item.price.toLocaleString()} each
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Minus / Remove */}
                <button
                  onClick={() =>
                    item.quantity <= 1
                      ? removeFromCart(item._id)
                      : updateQuantity({ cartItemId: item._id, quantity: item.quantity - 1 })
                  }
                  disabled={isItemBusy}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isItemUpdating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                </button>

                {/* Quantity */}
                <span className="w-6 text-center font-semibold text-sm">
                  {item.quantity}
                </span>

                {/* Plus */}
                <button
                  onClick={() =>
                    updateQuantity({ cartItemId: item._id, quantity: item.quantity + 1 })
                  }
                  disabled={isItemBusy}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isItemUpdating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                </button>

                {/* Trash */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  disabled={isItemBusy}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors ml-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isItemRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl p-4 z-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{cart.length} item{cart.length > 1 ? 's' : ''}</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total</span>
            <span className="text-blue-600">₦{total.toLocaleString()}</span>
          </div>
        <Button
          className="w-full h-12 bg-[#053c15]/95 text-white font-semibold rounded-xl hover:bg-[#053c05]/80"
          onClick={() => placeOrder()}
          disabled={isPlacingOrder || cart.length === 0}
        >
            {isPlacingOrder ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Order...
              </div>
            ) : (
              `Place Order • ₦${total.toLocaleString()}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;