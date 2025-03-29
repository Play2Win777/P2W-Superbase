// Responsive Pictures
export const getResponsiveImage = (id: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    // For mobile devices
    if (size === 'small') {
      return `https://your-supabase-url.com/storage/v1/object/public/covers/${id}_small.webp`;
    }
    
    // For laptops/desktops (default)
    if (size === 'medium') {
      return `https://your-supabase-url.com/storage/v1/object/public/covers/${id}.webp`;
    }
    
    // For large screens/TVs
    if (size === 'large') {
      return `https://your-supabase-url.com/storage/v1/object/public/covers/${id}_large.webp`;
    }
    
    // Fallback
    return `https://your-supabase-url.com/storage/v1/object/public/covers/${id}_fback.jpg`;
  };
  
  export const getImageSrcSet = (id: string) => {
    return `
      https://eeikeheizmdybnufjqji.supabase.co/storage/v1/object/public/covers/${id}_small.webp 225w,
      https://eeikeheizmdybnufjqji.supabase.co/storage/v1/object/public/covers/${id}.webp 375w,
      https://eeikeheizmdybnufjqji.supabase.co/storage/v1/object/public/covers/${id}_large.webp 900w,
      https://eeikeheizmdybnufjqji.supabase.co/storage/v1/object/public/covers/${id}_fback.jpg 300w
    `;
  };
  // End Responsive Pictures