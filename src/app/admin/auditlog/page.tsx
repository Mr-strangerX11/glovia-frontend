import React, { useEffect, useState } from 'react';

interface AuditLogEntry {
  _id: string;
  action: string;
  adminId: string;
  adminEmail: string;
  targetId: string;
  details: Record<string, any>;
  createdAt: string;
}

const fetchAuditLogs = async (): Promise<AuditLogEntry[]> => {
  const res = await fetch('/api/admin/auditlog');
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs()
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Action</th>
                <th className="p-2 border">Admin</th>
                <th className="p-2 border">Target</th>
                <th className="p-2 border">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="p-2 border">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-2 border">{log.action}</td>
                  <td className="p-2 border">{log.adminEmail}</td>
                  <td className="p-2 border">{log.targetId}</td>
                  <td className="p-2 border">
                    <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.details, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
