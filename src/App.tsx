import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import BaseList from './components/BaseList';
import AddBase from './components/AddBase';
import BaseService from './BaseService';
import { Base } from './models';

function App() {
  const { user, signOut } = useAuthenticator();
  const [bases, setBases] = useState<Base[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBases = async () => {
      try {
        const baseService = new BaseService();
        const basesData = await baseService.listBases();
        setBases(basesData);
      } catch (error) {
        console.error('Error fetching bases:', error);
        setError('Failed to fetch bases');
      } finally {
        setLoading(false);
      }
    };

    fetchBases();
  }, []);

  const handleAddBase = (newBase: Base) => {
    setBases((prevBases) => [...prevBases, newBase]);
  };

  const handleDeleteBase = (baseId: string) => {
    setBases((prevBases) => prevBases.filter(base => base.baseId !== baseId));
  };

  const handleUpdateBase = (updatedBase: Base) => {
    setBases((prevBases) => prevBases.map(base => (base.baseId === updatedBase.baseId ? updatedBase : base)));
  };

  return (
    <div>
      <p>Welcome, {user?.username}</p>
      <BaseList bases={bases} loading={loading} error={error} onDeleteBase={handleDeleteBase} onUpdateBase={handleUpdateBase} />
      <AddBase onAddBase={handleAddBase} />
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

export default App;