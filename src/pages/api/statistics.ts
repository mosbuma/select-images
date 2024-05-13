import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { authOptions } from './auth/[...nextauth]'
import { getServerSession } from "next-auth/next"
import { nftimages } from '../../assets/nftimages';

import type { Ratings, RatingStatistics } from './rate';
import { ratingsFilePath } from './rate';

// Stats type for each image
export type ImageStatistics = {
    positive: number;
    neutral: number;
    negative: number;
    unrated: number;
};

// Structure containing aggregated stats
export type ImageData = {
    ImageStatistics: { [key: string]: ImageStatistics };
};

// Function to aggregate the data using the appropriate types
function generateImageStatistics(data: Ratings): ImageData {
    // Get all images present in any user's dataset
    const allImages = new Set<string>();
    // Object.values(data).forEach(userImages => {
    //     Object.keys(userImages).forEach(image => allImages.add(image));
    // });
    nftimages.forEach(image => allImages.add(image));

    // Initialize the result object
    const ImageStatistics: { [key: string]: ImageStatistics } = {};

    // Initialize all image stats to zero
    allImages.forEach(image => {
        ImageStatistics[image] = { positive: 0, neutral: 0, negative: 0, unrated: 0 };
    });

    // Aggregate data using reduce
    Object.values(data).forEach(userImages => {
        Object.entries(userImages).forEach(([image, rating]) => {
            switch (rating) {
                case "+":
                    ImageStatistics[image].positive += 1;
                    break;
                case "0":
                    ImageStatistics[image].neutral += 1;
                    break;
                case "-":
                    ImageStatistics[image].negative += 1;
                    break;
                case false:
                    ImageStatistics[image].unrated += 1;
                    break;
            }
        });
    });

    return { ImageStatistics };
}

// Function to filter and sort image stats
function filterAndSortImageStatistics(
    imageData: ImageData,
    filterFunc: (stats: ImageStatistics) => boolean
): ImageData {
    const filteredStats: { [key: string]: ImageStatistics } = {};

    // Apply filter
    Object.entries(imageData.ImageStatistics).forEach(([image, stats]) => {
        if (filterFunc(stats)) {
            filteredStats[image] = stats;
        }
    });

    // Convert to an array and sort according to the criteria
    const sortedStats = Object.entries(filteredStats).sort((a, b) => {
        const [imageA, statsA] = a;
        const [imageB, statsB] = b;

        // Sort descending by positive score
        if (statsA.positive !== statsB.positive) {
            return statsB.positive - statsA.positive;
        }

        // Sort descending by neutral score
        if (statsA.neutral !== statsB.neutral) {
            return statsB.neutral - statsA.neutral;
        }

        // Sort ascending by negative score
        if (statsA.negative !== statsB.negative) {
            return statsA.negative - statsB.negative;
        }

        // Sort alphabetically by image name
        return imageA.localeCompare(imageB);
    });

    // Convert sorted array back to an object
    const sortedStatsObj: { [key: string]: ImageStatistics } = Object.fromEntries(sortedStats);

    return { ImageStatistics: sortedStatsObj };
}

// Example filter function: Keep images with no negative ratings
const filterFunctionSelection = (stats: ImageStatistics) => {
    return (stats.negative === 0) && (stats.positive > 0);
};

// Function to rename and move images
function downloadAndMoveImages(imageData: ImageData, sourceDir: string, targetDir: string) {
    // Ensure that the target directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Convert the imageData object to a sorted list based on keys
    const sortedImages = Object.keys(imageData.ImageStatistics);

    // Loop through each image and move it with the new naming convention
    sortedImages.forEach((originalName, index) => {
        const originalPath = path.join(sourceDir, originalName);

        // Extract the file extension and generate the new filename
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension);
        const newName = `${String(index + 1).padStart(3, '0')}-${baseName}${extension}`;
        const newPath = path.join(targetDir, newName);

        // Check if the image exists in the source folder and copy/move to the new folder
        if (fs.existsSync(originalPath)) {
            fs.copyFileSync(originalPath, newPath);
            console.log(`Image moved to: ${newPath}`);
        } else {
            console.warn(`Image not found: ${originalPath}`);
        }
    });
}

export const getExportList = () => {
    // const aggregatedStats = generateImageStatistics(ratings);

    // const filteredAndSortedStats = filterAndSortImageStatistics(aggregatedStats, filterFunc);

    // console.log("I got %s images:", Object.keys(filteredAndSortedStats.ImageStatistics).length);

    // // Source directory within the Next.js app's `public` folder
    // const sourceDir = path.join('..', 'public');

    // // Target directory for renamed images
    // const targetDir = path.join(__dirname, 'public', 'final-images');

    // console.log("sourceDir: %s", sourceDir);

    // // downloadAndMoveImages(filteredAndSortedStats, sourceDir, targetDir);

    // return filteredAndSortedStats;
}

export const getRatingStatistics = (imagename: string): RatingStatistics => {
    // Load existing ratings
    let ratings: Ratings = {};
    if (false !== fs.existsSync(ratingsFilePath)) {
        const data = fs.readFileSync(ratingsFilePath, 'utf8')
        ratings = JSON.parse(data) as Ratings
    }

    const aggregatedStats = generateImageStatistics(ratings);

    const ratingstats: RatingStatistics = {
        positive: 0,
        neutral: 0,
        negative: 0,
        included: false,
        totalincluded: 0,
        totalexcluded: 0
    };

    if (imagename in aggregatedStats.ImageStatistics) {
        const thisitem = aggregatedStats.ImageStatistics[imagename]
        ratingstats.positive = thisitem.positive;
        ratingstats.neutral = thisitem.neutral;
        ratingstats.negative = thisitem.negative;
        ratingstats.included = filterFunctionSelection(thisitem);
    }

    for (const item in aggregatedStats.ImageStatistics) {
        if (filterFunctionSelection(aggregatedStats.ImageStatistics[item])) {
            ratingstats.totalincluded += 1;
        } else {
            ratingstats.totalexcluded += 1;
        }
    }

    // console.log("ratingStats:", ratingstats);

    return ratingstats;
}