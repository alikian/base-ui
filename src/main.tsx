// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';

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
        username: false,
        email: true, // Optional
        phone: false, // Optional
      }
    }
  }
});



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Authenticator 
      signUpAttributes={['email']}
      loginMechanisms={['email']}
    >
      <App />
    </Authenticator>
  </React.StrictMode>
);