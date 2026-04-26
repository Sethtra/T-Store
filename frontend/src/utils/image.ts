export const getImageUrl = (path?: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000';
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) return path;
  
  // Clean path: remove leading slash and any existing 'storage/' prefix 
  // because we append it below. This prevents double /storage/storage/
  let cleanPath = path.startsWith('/') ? path.substring(1) : path;
  if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.substring(8);
  }
  
  // Use Vite API URL variable, default to port 8000 for local dev
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Ensure we don't accidentally append /api/ if VITE_API_URL includes it
  const cleanBase = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  
  return `${cleanBase}/storage/${cleanPath}`;
};
