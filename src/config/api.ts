// Dynamic API Base URL detection:
// Automatically uses production backend when deployed on Vercel/live domain,
// and localhost backend when running locally.




const API_BASE_URL = 'https://job-backend-nu.vercel.app/api';

export default API_BASE_URL;
