/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';
import Image, { StaticImageData } from 'next/image';

import type { RatingInfo, Rating, RatingStatisticsSingle, RatingTotalCounts } from '../tools/types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

interface ImageCarouselProps {
    images: string[];
    useHTMLImageElement?: boolean;
    startImage?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, useHTMLImageElement = true, startImage }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(() => {
        return startImage ? images.indexOf(startImage) : 0
    });
    const [currentRating, setCurrentRating] = useState<Rating>(false);
    const [currentStatistics, setCurrentStatistics] = useState<RatingStatisticsSingle | false>(false);
    const [totalCounts, setTotalCounts] = useState<RatingTotalCounts | false>({ included: 0, excluded: 0 });

    const totalImages = images.length;

    const goToPrevious = (totalImages: number) => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : totalImages - 1));
    };

    const goToNext = useCallback(async (totalImages: number) => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages)
    }, [setCurrentIndex]);

    const jumpToImage = (index: number) => {
        if (index >= 0 && index < totalImages) {
            setCurrentIndex(index);
        }
    };

    const rateImage = useCallback(async (imageName: string, rating: string) => {
        setCurrentRating(rating as Rating);

        await fetch('/api/rate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageName, rating }),
        });

        goToNext(totalImages);
    }, [setCurrentRating, goToNext, totalImages]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                goToPrevious(totalImages);
            } else if (event.key === 'ArrowRight') {
                goToNext(totalImages);
            } if (event.key === '1') {
                rateImage(images[currentIndex], '-');
            } else if (event.key === '2') {
                rateImage(images[currentIndex], '+');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup the event listener
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [images, rateImage, currentIndex, totalImages, goToNext]);

    const fetchCurrentRating = async (imageName: string, setCurrentRating: Function) => {
        const response = await fetch('/api/rate/?imagename=' + imageName, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const ratinginfo = await response.json() as RatingInfo;
        // console.log("got rating info", JSON.stringify(ratinginfo, null, 2));
        setCurrentRating(ratinginfo.user);
        setCurrentStatistics(ratinginfo.all);
        setTotalCounts(ratinginfo.totalcounts);
    }

    useEffect(() => {
        fetchCurrentRating(images[currentIndex], setCurrentRating);
    }, [currentIndex, images]);

    // const fetchCurrentStats = async (imageName: string, setCurrentStats: Function) => {
    //     const response = await fetch('/api/stats/?imagename=' + imageName, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //     });

    //     const stats = await response.json();
    //     setCurrentStats({ ...stats } as ImageStats);
    // }

    const step = 125
    const buttoncounts = [];
    for (let i = 0; i < totalImages; i += step) {
        buttoncounts.push(i);
    }
    if ((totalImages - 1) % step !== 0) {
        buttoncounts.push(totalImages - 1);
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full pb-40">
            <h2 className="text-4xl font-bold mb-4 uppercase">{images[currentIndex].replace(".jpg", "")}</h2>

            <div className="flex justify-center mb-2" style={{ fontSize: '2vh' }}>
                <button
                    onClick={() => goToPrevious(totalImages)}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-1"
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {"<"}
                </button>

                {buttoncounts.map((index) => (
                    <button
                        key={index}
                        onClick={() => jumpToImage(index)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full m-1"
                        style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={() => goToNext(totalImages)}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-1"
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {">"}
                </button>
            </div>

            <div className="flex-col relative w-5/6 h-5/6 flex items-center justify-center p-1">
                {useHTMLImageElement === false ?
                    <Image
                        src={`/images/nft-candidates/${images[currentIndex]}`}
                        alt={`showing image ${images[currentIndex]}`}
                        layout="fill"
                        objectFit="contain"
                    />
                    :
                    <img
                        src={`/images/nft-candidates/${images[currentIndex]}`}
                        alt={`showing image ${images[currentIndex]}`}
                        className="object-contain"
                        style={{ width: '100%', height: '100%' }}
                    />

                }
            </div>

            <div className="flex flex-row relative w-5/6 h-5/6 justify-center p-1" style={{ fontSize: '4vh' }}>
                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-2 mx-10 justify-center align-middle ${currentRating === '-' ? 'bg-yellow-500' : ''}`}
                    style={{ width: '8vh', height: '8vh' }}
                    onClick={() => rateImage(images[currentIndex], '-')}>-</button>

                {/* <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-2 mx-10 ${currentRating === '0' ? 'bg-yellow-500' : ''}`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}
                    onClick={() => rateImage(images[currentIndex], '0')}>-/+</button> */}

                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-2 mx-10 ${currentRating === '+' ? 'bg-yellow-500' : ''}`}
                    style={{ width: '8vh', height: '8vh' }}
                    onClick={() => rateImage(images[currentIndex], '+')}>+</button>
            </div>

            <div className="flex flex-row relative w-auto h-5/6 justify-center p-5 bg-yellow-200 rounded-full mt-20" style={{ fontSize: '2vh' }}>
                {currentStatistics ?
                    <div
                        className={`${currentStatistics.included ? 'bg-green-500' : 'bg-red-500'} text-black font-bold rounded-full ml-2 mr-40 flex justify-center items-center`}
                        style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                        <FontAwesomeIcon icon={currentStatistics.included ? faCheck : faTimes} />
                    </div> : null}
                <div
                    className={`bg-green-500 text-black font-bold rounded-full mx-5 flex justify-center align-center`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {currentStatistics && currentStatistics.positive || "0"}
                </div>
                <div
                    className={`bg-red-500 text-black font-bold rounded-full mx-5 flex justify-center align-center`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {currentStatistics && currentStatistics.negative || "0"}
                </div>
                <div
                    className={`bg-green-500 text-black font-bold rounded-full ml-40 mr-2 flex justify-center align-center`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {totalCounts && totalCounts.included || "0"}
                </div>
                <div
                    className={`bg-red-500 text-black font-bold rounded-full mx-2 flex justify-center align-center`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {totalCounts && totalCounts.excluded || "0"}
                </div>
                <button
                    className={`bg-yellow-500 hover:bg-gray-400 text-black font-bold rounded-full m-2 ml-40 mx-10 justify-center align-middle`}
                    style={{ width: '15vw', height: '5vh' }}
                    onClick={() => window.location.href = `/gallery/${images[currentIndex]}`}>
                    Show Overview
                </button>
            </div>

        </div>
    );
};

export default ImageCarousel;
