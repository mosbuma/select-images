import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { authOptions } from './auth/[...nextauth]'
import { getServerSession } from "next-auth/next"
import { getRatingStatistics } from './statistics';

export type Rating = '+' | '0' | '-' | false;

export type RatingInfo = {
    user: Rating,
    all: RatingStatistics
}

export type RatingsForUser = {
    [filename: string]: Rating;
}

export type RatingStatistics = {
    positive: number,
    neutral: number,
    negative: number,
    included: boolean,
    totalincluded: number,
    totalexcluded: number
}

export type Ratings = {
    [email: string]: RatingsForUser;
}

export const ratingsFileFolder = path.join(process.cwd(), 'data');
export const ratingsFilePath = path.join(ratingsFileFolder, 'ratings.json');

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions)

    if (false === fs.existsSync(ratingsFileFolder)) {
        fs.mkdirSync(ratingsFileFolder);
        fs.writeFileSync(ratingsFilePath, JSON.stringify({}, null, 2));
    }

    if (null === session || session.user === undefined || !session.user.email) {
        return res.status(401).json({ message: 'You must be signed in to view the protected content.' });
    }

    // Load existing ratings
    let ratings: Ratings = {};
    if (fs.existsSync(ratingsFilePath)) {
        ratings = JSON.parse(fs.readFileSync(ratingsFilePath, 'utf8')) as Ratings
    } else {
        fs.writeFileSync(ratingsFilePath, JSON.stringify(ratings, null, 2));
    }

    if (req.method === 'GET') {

        // get statistics for the current image

        // Return ratings for the specific user
        const imagename = req.query.imagename || false;
        if (typeof imagename === 'string') {
            const ratingStatistics = getRatingStatistics(imagename);

            const userRatings = ratings[session.user.email] || [];
            let ratinginfo: RatingInfo = {
                user: userRatings[imagename] || false,
                all: ratingStatistics
            };
            // res.status(200).json(ratings[session.user.email][imagename]);
            res.status(200).json(ratinginfo)
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
        fs.writeFileSync(ratingsFilePath, JSON.stringify(ratings, null, 2));

        res.status(200).json({ message: 'Rating updated' });
    } else {
        // Handle other HTTP methods or return an error
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
