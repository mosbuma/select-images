import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from './auth/[...nextauth]'
import { getServerSession } from "next-auth/next"
import { getRatingStatistics } from '../../tools/statistics';
import { loadRatings } from '../../tools/functions';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions)

    if (null === session || session.user === undefined || !session.user.email) {
        return res.status(401).json({ message: 'You must be signed in to view the protected content.' });
    }

    if (req.method === 'GET') {
        const detailedstats = getRatingStatistics()
        res.status(200).json(detailedstats)
    } else {
        // Handle other HTTP methods or return an error
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
