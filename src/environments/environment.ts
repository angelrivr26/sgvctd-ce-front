// Desarrollo local. Angular redirige /api al backend local mediante proxy.conf.json.
export const environment = {
  production: false,
  //API_URL: '/api/v1',
  API_URL: 'http://10.10.14.130:4005'
};
