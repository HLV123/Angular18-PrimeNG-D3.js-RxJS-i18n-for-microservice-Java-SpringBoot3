export const environment = {
  production: false,
  useMockData: true,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws',
  keycloak: {
    url: 'http://localhost:8180',
    realm: 'iris',
    clientId: 'iris-frontend'
  }
};