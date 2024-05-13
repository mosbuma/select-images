/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';

import type { RatingInfo, Rating, RatingStatistics } from '../pages/api/rate';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

interface ImageCarouselProps {
    images: string[];
    useHTMLImageElement?: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, useHTMLImageElement = true }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [currentRating, setCurrentRating] = useState<Rating>(false);
    const [currentStatistics, setCurrentStatistics] = useState<RatingStatistics | false>(false);

    const totalImages = images.length;

    const goToPrevious = (totalImages: number) => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : totalImages - 1));
    };

    const goToNext = (totalImages: number) => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
    };

    const jumpToImage = (index: number) => {
        if (index >= 0 && index < totalImages) {
            setCurrentIndex(index);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                goToPrevious(totalImages);
            } else if (event.key === 'ArrowRight') {
                goToNext(totalImages);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup the event listener
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentIndex, totalImages]);

    const fetchCurrentRating = async (imageName: string, setCurrentRating: Function) => {
        const response = await fetch('/api/rate/?imagename=' + imageName, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const ratinginfo = await response.json();
        // console.log("got rating info", JSON.stringify(ratinginfo, null, 2));
        setCurrentRating((ratinginfo as RatingInfo).user);
        setCurrentStatistics((ratinginfo as RatingInfo).all);
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

    const rateImage = async (imageName: string, rating: string) => {
        setCurrentRating(rating as Rating);
        setCurrentStatistics((prevStats) => { return false });

        await fetch('/api/rate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageName, rating }),
        });

        goToNext(totalImages);

        // const response = 
        // const data = await response.json();
        // Handle the response
    };

    const step = 100
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
                        src={`/images/nft-images/${images[currentIndex]}`}
                        alt={`showing image ${images[currentIndex]}`}
                        layout="fill"
                        objectFit="contain"
                    />
                    :
                    <img
                        src={`/images/nft-images/${images[currentIndex]}`}
                        alt={`showing image ${images[currentIndex]}`}
                        className="object-contain"
                        style={{ width: '100%', height: '100%' }}
                    />

                }
            </div>

            <div className="flex flex-row relative w-5/6 h-5/6 justify-center p-1" style={{ fontSize: '2vh' }}>
                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-2 mx-10 ${currentRating === '-' ? 'bg-yellow-500' : ''}`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}
                    onClick={() => rateImage(images[currentIndex], '-')}>-</button>

                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-2 mx-10 ${currentRating === '0' ? 'bg-yellow-500' : ''}`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}
                    onClick={() => rateImage(images[currentIndex], '0')}>-/+</button>

                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-2 mx-10 ${currentRating === '+' ? 'bg-yellow-500' : ''}`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}
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
                    className={`bg-gray-300  text-black font-bold rounded-full mx-5 flex justify-center align-center`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {currentStatistics && currentStatistics.neutral || "0"}
                </div>
                <div
                    className={`bg-red-500 text-black font-bold rounded-full mx-5 flex justify-center align-center`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {currentStatistics && currentStatistics.negative || "0"}
                </div>
                <div
                    className={`bg-green-500 text-black font-bold rounded-full ml-40 mr-2 flex justify-center align-center`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {currentStatistics && currentStatistics.totalincluded || "0"}
                </div>
                <div
                    className={`bg-red-500 text-black font-bold rounded-full mx-2 flex justify-center align-center`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {currentStatistics && currentStatistics.totalexcluded || "0"}
                </div>
            </div>
        </div>
    );
};

export default ImageCarousel;
