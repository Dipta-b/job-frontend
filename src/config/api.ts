// Dynamic API Base URL detection:
// Automatically uses production backend when deployed on Vercel/live domain,
// and localhost backend when running locally.

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const envUrl = import.meta.env.VITE_API_URL;

const API_BASE_URL = isLocalhost
  ? (envUrl || 'http://localhost:3000/api')
  : (envUrl && !envUrl.includes('localhost') ? envUrl : 'https://job-backend-nu.vercel.app/api');

export default API_BASE_URL;
