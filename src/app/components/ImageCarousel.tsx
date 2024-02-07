import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
    images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalImages = images.length;

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : totalImages - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
    };

    const jumpToImage = (index: number) => {
        if (index >= 0 && index < totalImages) {
            setCurrentIndex(index);
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            goToPrevious();
        } else if (event.key === 'ArrowRight') {
            goToNext();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup the event listener
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentIndex]);

    return (
        <div className="relative w-full h-full pb-40">
            <h2 className="text-4xl font-bold mb-4 text-center uppercase ">{images[currentIndex].replace(".jpg", "")}</h2>
            <div className="relative w-auto h-full pl-1 pr-1">

                <Image
                    src={'/nft-images/' + images[currentIndex]}
                    alt={`Image ${currentIndex}`}
                    fill={true}
                    layout="fill"
                    objectFit="contain"
                />
            </div>

            <div className="flex justify-center mt-4">
                <button
                    onClick={goToPrevious}
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
                    onClick={goToNext}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-1 rounded-full m-2 text-2xl w-20 h-20 ml-20">
                    {">"}
                </button>
            </div>
        </div>
    );
};

export default ImageCarousel;
