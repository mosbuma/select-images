import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from './auth/[...nextauth]'
import { getServerSession } from "next-auth/next"
import { getRatingStatistics } from '../../tools/statistics';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions)

    if (null === session || session.user === undefined || !session.user.email) {
        return res.status(401).json({ message: 'You must be signed in to view the protected content.' });
    }

    if (req.method === 'GET') {
        // Return ratings for the specific user
        const ratingStatistics = getRatingStatistics();
        console.log(JSON.stringify(ratingStatistics, null, 2));

        let script = "";
        script += "#!/bin/bash\n";
        script += "mkdir -p included/thumbnail\n";
        script += "mkdir -p excluded/thumbnail\n";
        script += "\n";

        let includedcounter = 1;
        let excludedcounter = 1;
        const filenames = Object.keys(ratingStatistics);
        for (const filename of filenames) {
            // ratings file uses jpg thumbnail file names, originals are png (in subfolder original)
            const orgname = 'original/' + filename.replace('jpg', 'png');
            if (ratingStatistics[filename].included) {
                script += `cp "${filename}" included/thumbnail/nft-${includedcounter}.jpg\n`;
                script += `cp "${orgname}" included/nft-${includedcounter}.png\n`;
                includedcounter++;
            } else {
                script += `cp "${filename}" excluded/thumbnail/bad-${excludedcounter}.jpg\n`;
                script += `cp "${orgname}" excluded/bad-${excludedcounter}.png\n`;
                excludedcounter++;
            }
            script += "\n";
        }

        let result = { script: script }
        // console.log(result);

        res.status(200).json(result);
    } else {
        // Handle other HTTP methods or return an error
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
