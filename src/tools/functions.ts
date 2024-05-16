import fs from 'fs';
import { ratingsFileFolder, ratingsFilePath } from './const';
import { RatingsForAllUsers } from './types';

export const loadRatings = () => {
    if (false === fs.existsSync(ratingsFileFolder)) {
        fs.mkdirSync(ratingsFileFolder);
        fs.writeFileSync(ratingsFilePath, JSON.stringify({}, null, 2));
    }

    // Load existing ratings
    let ratings: RatingsForAllUsers = {};
    let modified = false
    if (fs.existsSync(ratingsFilePath)) {
        ratings = JSON.parse(fs.readFileSync(ratingsFilePath, 'utf8')) as RatingsForAllUsers
    } else {
        modified = true;
    }

    // convert old ratings file format to new format, ie. load the file and convert all '0' ratings to '-'
    for (const email in ratings) {
        for (const filename in ratings[email]) {
            if (ratings[email][filename] === '0') {
                // console.log('converted 0 to - for', email, filename);
                ratings[email][filename] = '-';
                modified = true;
            }
        }
    };
    if (modified) {
        // console.log("ratings file updated");
        fs.writeFileSync(ratingsFilePath, JSON.stringify(ratings, null, 2));
    }

    return ratings;
}

export const storeRatings = (ratings: RatingsForAllUsers) => {
    fs.writeFileSync(ratingsFilePath, JSON.stringify(ratings, null, 2));
}