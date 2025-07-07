import React, { useEffect, useState } from 'react';

const BackendStatusCheck = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'db-error', 'offline'
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/db`);

        const json = await res.json(); // always try to parse the response

        if (res.ok) {
          setResponse(json);
          setStatus('connected');
        } else {
          // e.g. MongoDB is disconnected but backend responded
          setResponse(json);
          setStatus('db-error');
        }
      } catch (err) {
        // Backend is unreachable
        setError(err.message || 'Unknown network error');
        setStatus('offline');
      }
    };

    checkBackend();
  }, [backendUrl]);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <h2 className="text-2xl text-green-400 font-bold mb-4">🔗 Backend Connectivity Check</h2>

      <div className="mb-6">
        <p className="text-gray-300 mb-2">🌐 <span className="text-white font-semibold">Backend URL:</span></p>
        <ul className="list-disc pl-6 text-blue-400">
          <li><a href={`${backendUrl}/api/ping`} target="_blank" rel="noopener noreferrer" className="hover:underline">/api/ping</a></li>
          <li><a href={`${backendUrl}/api/db`} target="_blank" rel="noopener noreferrer" className="hover:underline">/api/db</a></li>
        </ul>
      </div>

      {status === 'checking' && (
        <p className="text-gray-400">⏳ Checking backend connection...</p>
      )}

      {status === 'connected' && (
        <div>
          <p className="text-green-500 font-semibold mb-2">
            ✅ Backend is <span className="underline">connected</span> and responding!
          </p>
          <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-green-200">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {status === 'db-error' && (
        <div>
          <p className="text-yellow-400 font-semibold mb-2">
            ⚠️ Backend is reachable but reported a database issue.
          </p>
          <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-yellow-200">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {status === 'offline' && (
        <div>
          <p className="text-red-500 font-semibold">
            ❌ Backend is <span className="underline">not responding</span> (server offline or unreachable).
          </p>
          <p className="text-red-300 mt-2 text-sm">
            Error: <code className="bg-gray-900 px-2 py-1 rounded">{error}</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default BackendStatusCheck;
