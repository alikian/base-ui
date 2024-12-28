// index.js
import React from 'react';
import { AuthProvider } from "react-oidc-context";
import ReactDOM from 'react-dom/client';
import App from './App';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_jPwwDxCeY",
  client_id: "2p178tbstm4og868kk09riabpa",
  redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "email openid profile",
};



Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: '2p178tbstm4og868kk09riabpa',
      userPoolId: 'us-west-2_jPwwDxCeY',
      loginWith: { // Optional
        oauth: {
          domain: 'base-cup.auth.us-west-2.amazoncognito.com',
          scopes: ['openid','email','phone'],
          redirectSignIn: ['http://localhost:3000/','https://example.com/'],
          redirectSignOut: ['http://localhost:3000/','https://example.com/'],
          responseType: 'code',
        },
        username: true,
        email: false, // Optional
        phone: false, // Optional
      }
    }
  }
});


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Authenticator>
      <App />
    </Authenticator>
  </React.StrictMode>
);