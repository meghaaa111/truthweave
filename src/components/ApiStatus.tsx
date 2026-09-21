import { useEffect, useState } from 'react';
import { testConnection } from '@/lib/api';

export const ApiStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const checkApi = async () => {
      const isConnected = await testConnection();
      setStatus(isConnected ? 'connected' : 'disconnected');
    };
    checkApi();
  }, []);

  if (status === 'checking') return null;

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm ${
      status === 'connected' 
        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
        : 'bg-red-500/20 text-red-400 border border-red-500/30'
    }`}>
      API: {status === 'connected' ? '✓ Connected' : '✗ Disconnected'}
    </div>
  );
};
