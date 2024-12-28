// App.js
import { useAuthenticator } from '@aws-amplify/ui-react';

function App() {
  const { user, signOut } = useAuthenticator();

  return (
    <div>
      <p>Welcome, {user?.username}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}
  
export default App;