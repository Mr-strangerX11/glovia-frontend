import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerApiBaseUrl } from '@/lib/apiBase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = getServerApiBaseUrl();
    const healthUrl = `${backendUrl}/health`;
    const response = await fetch(healthUrl);
    if (response.ok) {
      res.status(200).json({ status: 'ok', backend: backendUrl });
    } else {
      res.status(500).json({ status: 'fail', backend: backendUrl });
    }
  } catch (error) {
    res.status(500).json({ status: 'fail', error: (error as Error).message });
  }
}
