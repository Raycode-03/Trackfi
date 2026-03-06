export interface MenuItem {
  _id:string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string | null;
  video_url?: string | null;
  is_veg?: boolean;
  is_vegan?: boolean;
  is_available?: boolean;
}
// For creating - same as MenuItem but without _id
export type CreateMenuItem = Omit<MenuItem, '_id' | ' image_url' | 'video_url '| 'created_at' | 'updated_at'>;
export type UpdateMenuItem = Partial<
  Omit<MenuItem, "_id">
> & {  updated_at?: string;};
export interface MenuItemWithRestaurant extends MenuItem {
  restaurant_id: string;
}