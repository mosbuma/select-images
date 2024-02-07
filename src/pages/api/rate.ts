import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { authOptions } from './auth/[...nextauth]'
import { getServerSession } from "next-auth/next"

export type Rating = '+' | '0' | '-' | false;

export type RatingsForUser = {
    [filename: string]: Rating;
}

export type Ratings = {
    [email: string]: RatingsForUser;
}

const ratingsFileFolder = path.join(process.cwd(), 'data');
const ratingsFilePath = path.join(ratingsFileFolder, 'ratings.json');

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
        // Return ratings for the specific user
        if (session.user.email in ratings) {
            const { imagename } = req.query;
            if (typeof imagename === 'string') {
                if (imagename in ratings[session.user.email]) {
                    res.status(200).json(ratings[session.user.email][imagename]);
                } else {
                    res.status(200).json(false);
                }
            } else {
                res.status(401).json({ message: 'imagename must be a single string.' });
            }
        } else {
            res.status(200).json([]);
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
