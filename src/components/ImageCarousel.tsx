/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';

import type { Rating } from '../pages/api/rate';
import type { NftImages } from '../assets/nftimages';
interface ImageCarouselProps {
    images: NftImages;
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
        fetchCurrentRating(images[currentIndex].name, setCurrentRating);
    }, [currentIndex, images]);

    const rateImage = async (imageName: string, rating: string) => {
        setCurrentRating(rating as Rating);

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

    return (
        <div className="flex flex-col items-center justify-center w-full h-full pb-40">
            <h2 className="text-4xl font-bold mb-4 uppercase">{images[currentIndex].name.replace(".jpg", "")}</h2>

            <div className="flex justify-center mb-2" style={{ fontSize: '2vh' }}>
                <button
                    onClick={() => goToPrevious(totalImages)}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-1"
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {"<"}
                </button>

                {[1, 50, 100, 150, 200, 250].map((index) => (
                    <button
                        key={index}
                        onClick={() => jumpToImage(index)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full m-1"
                        style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                        {index}
                    </button>
                ))}
                <button
                    onClick={() => goToNext(totalImages)}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-1"
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
                    {">"}
                </button>
            </div>

            <div className="w-full h-full flex items-center justify-center p-1">
                <Image
                    src={images[currentIndex].image}
                    alt={`Image ${currentIndex}`}
                    style={{ minWidth: '60vh', height: 'auto', maxWidth: '100%' }}
                />
            </div>

            <div className="flex justify-center mt-2" style={{ fontSize: '2vh' }}>
                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-2 text-2xl ml-20 ${currentRating === '-' ? 'bg-yellow-500' : ''}`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}
                    onClick={() => rateImage(images[currentIndex].name, '-')}>-</button>

                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-2 text-2xl ml-20 ${currentRating === '0' ? 'bg-yellow-500' : ''}`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}
                    onClick={() => rateImage(images[currentIndex].name, '0')}>-/+</button>

                <button
                    className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full m-2 text-2xl ml-20 ${currentRating === '+' ? 'bg-yellow-500' : ''}`}
                    style={{ width: '5vh', height: '5vh', padding: '1vh' }}
                    onClick={() => rateImage(images[currentIndex].name, '+')}>+</button>
            </div>
        </div>
    );
};

export default ImageCarousel;
