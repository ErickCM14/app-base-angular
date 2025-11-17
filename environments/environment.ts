export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  appName: 'Admin Base',
  apiBase: 'http://ec2-18-118-241-165.us-east-2.compute.amazonaws.com',
  versions: {
    v1: '/api/v1',
    v2: '/api/v2'
  },
  endpoints: {
    auth: 'auth',
    users: 'users',
    faqs: 'questionnaire',
    notifications: 'push-notification',
  },
};
