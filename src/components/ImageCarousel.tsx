import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import type { Rating } from '../pages/api/rate';

interface ImageCarouselProps {
    images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [currentRating, setCurrentRating] = useState<Rating>(false);

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

        const rating = await response.json();
        setCurrentRating(rating as Rating);
    }

    useEffect(() => {
        fetchCurrentRating(images[currentIndex], setCurrentRating);
    }, [currentIndex, images]);

    const rateImage = async (imageName: string, rating: string) => {
        setCurrentRating(rating as Rating);

        const response = await fetch('/api/rate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageName, rating }),
        });

        goToNext(totalImages);

        // const data = await response.json();
        // Handle the response
    };

    return (
        <div className="relative w-full h-full pb-40">
            <h2 className="text-4xl font-bold mb-4 text-center uppercase ">{images[currentIndex].replace(".jpg", "")}</h2>
            <div className="flex justify-center mt-4">
                <button
                    onClick={() => goToPrevious(totalImages)}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-1 rounded-full m-2 text-2xl w-20 h-20 mr-20">
                    {"<"}
                </button>

                {[1, 50, 100, 150, 200, 250].map((index) => (
                    <button
                        key={index}
                        onClick={() => jumpToImage(index)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-1 px-1 rounded-full m-2 text-2xl w-20 h-20">
                        {index}
                    </button>
                ))}
                <button
                    onClick={() => goToNext(totalImages)}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-1 rounded-full m-2 text-2xl w-20 h-20 ml-20">
                    {">"}
                </button>
            </div>
            <div className="relative w-auto h-full pl-1 pr-1">
                <Image
                    src={'/nft-images/' + images[currentIndex]}
                    alt={`Image ${currentIndex}`}
                    fill={true}
                    objectFit="contain"
                />
            </div>
            <div className="flex justify-center mt-4">
                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-1 rounded-full m-2 text-2xl w-20 h-20 ml-20 ${currentRating === '-' ? 'bg-yellow-500' : ''}`}
                    onClick={() => rateImage(images[currentIndex], '-')}>-</button>

                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-1 rounded-full m-2 text-2xl w-20 h-20 ml-20 ${currentRating === '0' ? 'bg-yellow-500' : ''}`}
                    onClick={() => rateImage(images[currentIndex], '0')}>-/+</button>

                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-1 rounded-full m-2 text-2xl w-20 h-20 ml-20 ${currentRating === '+' ? 'bg-yellow-500' : ''}`}
                    onClick={() => rateImage(images[currentIndex], '+')}>+</button>
            </div>
        </div>
    );
};

export default ImageCarousel;
