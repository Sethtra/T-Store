export const getImageUrl = (path?: string) => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  
  // Clean path to prevent double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Use Vite API URL variable, default to port 8000 for local dev
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Ensure we don't accidentally append /api/ if VITE_API_URL includes it
  const cleanBase = baseUrl.replace(/\/api\/?$/, '');
  
  return `${cleanBase}/storage/${cleanPath}`;
};
