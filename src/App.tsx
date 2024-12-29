import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import BaseList from './components/BaseList';
import { fetchAuthSession } from 'aws-amplify/auth';


function App() {
  const { user, signOut } = useAuthenticator();
  console.log(user);
  // Assuming the OAuth token is stored in the user's signInUserSession object

  return (
    <div>
      <p>Welcome, {user?.username}</p>
      <BaseList  />
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

export default App;