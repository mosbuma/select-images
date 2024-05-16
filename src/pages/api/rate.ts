import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from './auth/[...nextauth]'
import { getServerSession } from "next-auth/next"
import { getRatingStatisticsForImage, getTotalCounts } from '../../tools/statistics';
import type { RatingInfo } from '../../tools/types';
import { loadRatings, storeRatings } from '../../tools/functions';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions)

    if (null === session || session.user === undefined || !session.user.email) {
        return res.status(401).json({ message: 'You must be signed in to view the protected content.' });
    }

    const ratings = loadRatings();

    if (req.method === 'GET') {
        // Return ratings for the specific user
        const imagename = req.query.imagename || false;
        if (typeof imagename === 'string') {
            const ratingStatistics = getRatingStatisticsForImage(imagename);
            const totalcounts = getTotalCounts();
            if (false !== ratingStatistics) {
                const userRatings = ratings[session.user.email] || [];
                let ratinginfo: RatingInfo = {
                    user: userRatings[imagename] || false,
                    all: ratingStatistics,
                    totalcounts: totalcounts
                };
                // res.status(200).json(ratings[session.user.email][imagename]);
                res.status(200).json(ratinginfo)
            }
        } else {
            res.status(401).json({ message: 'imagename must be a single string.' });
        }
    } else if (req.method === 'POST') {
        const { imageName, rating } = req.body;

        // Update rating for the specific user and image
        if (!ratings[session.user.email]) {
            ratings[session.user.email] = {};
        }

        if (false === rating) {
            delete ratings[session.user.email][imageName];
        } else {
            ratings[session.user.email][imageName] = rating;
        }

        // Save updated ratings
        storeRatings(ratings);

        res.status(200).json({ message: 'Rating updated' });
    } else {
        // Handle other HTTP methods or return an error
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
