import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { nftimages } from '../assets/nftimages';
import { loadRatings } from './functions';

import type { RatingTotalCounts, RatingStatisticsSingle, RatingStatisticsMultiple } from './types';

export const getTotalCounts = (): RatingTotalCounts => {

    const counts: RatingTotalCounts = { included: 0, excluded: 0 };
    const statistics = getRatingStatistics();
    for (const imagename in statistics) {
        if (statistics[imagename].included) {
            counts.included += 1;
        } else {
            counts.excluded += 1;
        }
    }
    return counts;
};

// Function to aggregate the data using the appropriate types
export const getRatingStatistics = (): RatingStatisticsMultiple => {
    const allImages = new Set<string>();
    nftimages.forEach(image => allImages.add(image));

    // Initialize the result object
    const statsPerImage: RatingStatisticsMultiple = {};

    // Initialize all image stats to zero
    allImages.forEach(image => {
        statsPerImage[image] = { positive: 0, negative: 0, included: false };
    });

    // Aggregate data using reduce
    const data = loadRatings();
    Object.values(data).forEach(userImages => {
        Object.entries(userImages).forEach(([image, rating]) => {
            switch (rating) {
                case "+":
                    statsPerImage[image].positive += 1;
                    break;
                case "-":
                    statsPerImage[image].negative += 1;
                    break;
            }

            let stats = statsPerImage[image];
            statsPerImage[image].included = (stats.negative === 0) && (stats.positive > 0);
        });
    });

    return statsPerImage;
}

export const getRatingStatisticsForImage = (imagename: string): RatingStatisticsSingle | false => {
    const aggregatedStats = getRatingStatistics();
    if (imagename in aggregatedStats) {
        return aggregatedStats[imagename];
    } else {
        return { positive: 0, negative: 0, included: false };
    }
}

// Function to filter and sort image stats
// function filterAndSortImageStatistics(
//     imageData: ImageData,
//     filterFunc: (stats: RatingStatisticsSingle) => boolean
// ): RatingStatisticsMultiple {
//     const filteredStats: RatingStatisticsMultiple = {};

//     // Apply filter
//     Object.entries(imageData.ImageStatistics).forEach(([image, stats]) => {
//         if (filterFunc(stats)) {
//             filteredStats[image] = stats;
//         }
//     });

//     // Convert to an array and sort according to the criteria
//     const sortedStats = Object.entries(filteredStats).sort((a, b) => {
//         const [imageA, statsA] = a;
//         const [imageB, statsB] = b;

//         // Sort descending by positive score
//         if (statsA.positive !== statsB.positive) {
//             return statsB.positive - statsA.positive;
//         }

//         // Sort ascending by negative score
//         if (statsA.negative !== statsB.negative) {
//             return statsA.negative - statsB.negative;
//         }

//         // Sort alphabetically by image name
//         return imageA.localeCompare(imageB);
//     });

//     // Convert sorted array back to an object
//     const sortedStatsObj: RatingStatisticsMultiple = Object.fromEntries(sortedStats);

//     return { ImageStatistics: sortedStatsObj };
// }

// Function to rename and move images
// function downloadAndMoveImages(imageData: ImageData, sourceDir: string, targetDir: string) {
//     // Ensure that the target directory exists
//     if (!fs.existsSync(targetDir)) {
//         fs.mkdirSync(targetDir, { recursive: true });
//     }

//     // Convert the imageData object to a sorted list based on keys
//     const sortedImages = Object.keys(imageData.ImageStatistics);

//     // Loop through each image and move it with the new naming convention
//     sortedImages.forEach((originalName, index) => {
//         const originalPath = path.join(sourceDir, originalName);

//         // Extract the file extension and generate the new filename
//         const extension = path.extname(originalName);
//         const baseName = path.basename(originalName, extension);
//         const newName = `${String(index + 1).padStart(3, '0')}-${baseName}${extension}`;
//         const newPath = path.join(targetDir, newName);

//         // Check if the image exists in the source folder and copy/move to the new folder
//         if (fs.existsSync(originalPath)) {
//             fs.copyFileSync(originalPath, newPath);
//             console.log(`Image moved to: ${newPath}`);
//         } else {
//             console.warn(`Image not found: ${originalPath}`);
//         }
//     });
// }

// export const getExportList = () => {
//     // const aggregatedStats = getRatingStatistics(ratings);

//     // const filteredAndSortedStats = filterAndSortImageStatistics(aggregatedStats, filterFunc);

//     // console.log("I got %s images:", Object.keys(filteredAndSortedStats.ImageStatistics).length);

//     // // Source directory within the Next.js app's `public` folder
//     // const sourceDir = path.join('..', 'public');

//     // // Target directory for renamed images
//     // const targetDir = path.join(__dirname, 'public', 'final-images');

//     // console.log("sourceDir: %s", sourceDir);

//     // // downloadAndMoveImages(filteredAndSortedStats, sourceDir, targetDir);

//     // return filteredAndSortedStats;
// }