/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';

import Image, { StaticImageData } from 'next/image';

import type { RatingInfo, RatingTotalCounts, RatingStatisticsSingle, RatingStatisticsMultiple, ScriptResponse } from '../tools/types';
import RenderImage from './RenderImage';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

interface ImageGalleryProps {
    images: string[];
    useHTMLImageElement?: boolean;
    startImage?: string;
    isAdmin: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, useHTMLImageElement = true, startImage, isAdmin = false }) => {
    const [totalCounts, setTotalCounts] = useState<RatingTotalCounts | false>({ included: 0, excluded: 0 });
    const [currentStatistics, setCurrentStatistics] = useState<RatingStatisticsMultiple | false>(false);
    const [currentTab, setCurrentTab] = useState<string>('all');
    const [showDetails, setshowDetails] = useState(false);

    const fetchDetailedStats = async (imageName: string) => {
        const response = await fetch('/api/stats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const detailedstats = await response.json();
        return (detailedstats as RatingStatisticsMultiple);
    }

    useEffect(() => {
        const fetchStats = async () => {
            const detailedStats = await fetchDetailedStats("all");
            setCurrentStatistics(detailedStats);
        }
        fetchStats();
    }, []);

    useEffect(() => {
        if (startImage) {
            scrollToImage(startImage);
        }
    });

    const fetchCurrentTotalCounts = async () => {
        const response = await fetch('/api/rate/?imagename=all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const ratinginfo = await response.json() as RatingInfo;
        setTotalCounts(ratinginfo.totalcounts);
    }

    const fetchCurrentScript = async (): Promise<ScriptResponse> => {
        const response = await fetch('/api/script/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });


        console.log(response);
        const script = await response.json();
        console.log(script);
        return script;
    }

    useEffect(() => {
        fetchCurrentTotalCounts();
    }, []);

    const renderImages = () => {
        let filteredImages = images;
        if (currentTab === 'included') {
            filteredImages = images.filter(image => currentStatistics && currentStatistics[image].included);
        } else if (currentTab === 'excluded') {
            filteredImages = images.filter(image => currentStatistics && !currentStatistics[image].included);
        }

        if (filteredImages.length === 0) {
            return <div className="flex flex-row justify-center text-center w-full " style={{ fontSize: '2vh' }}>
                No candidate images available
            </div>
        }

        const gallery = filteredImages.map(image => {
            const statstics: RatingStatisticsSingle | false = currentStatistics && currentStatistics[image];
            return <RenderImage key={'img' + image} image={image} statistics={statstics} useHTMLImageElement={useHTMLImageElement} showCheck={currentTab === 'all'} showDetails={showDetails} />;
        });
        return gallery;
    }

    //     <div className="flex flex-row relative w-auto h-5/6 justify-center p-5 bg-yellow-200 rounded-full mt-20" style={{ fontSize: '2vh' }}>
    //     {currentStatistics ?
    //         <div
    //             className={`${currentStatistics.included ? 'bg-green-500' : 'bg-red-500'} text-black font-bold rounded-full ml-2 mr-40 flex justify-center items-center`}
    //             style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
    //             <FontAwesomeIcon icon={currentStatistics.included ? faCheck : faTimes} />
    //         </div> : null}
    //     <div
    //         className={`bg-green-500 text-black font-bold rounded-full mx-5 flex justify-center align-center`}
    //         style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
    //         {currentStatistics && currentStatistics.positive || "0"}
    //     </div>
    //     <div
    //         className={`bg-gray-300  text-black font-bold rounded-full mx-5 flex justify-center align-center`}
    //         style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
    //         {currentStatistics && currentStatistics.neutral || "0"}
    //     </div>
    //     <div
    //         className={`bg-red-500 text-black font-bold rounded-full mx-5 flex justify-center align-center`}
    //         style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
    //         {currentStatistics && currentStatistics.negative || "0"}
    //     </div>
    //     <div
    //         className={`bg-green-500 text-black font-bold rounded-full ml-40 mr-2 flex justify-center align-center`}
    //         style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
    //         {currentStatistics && currentStatistics.totalincluded || "0"}
    //     </div>
    //     <div
    //         className={`bg-red-500 text-black font-bold rounded-full mx-2 flex justify-center align-center`}
    //         style={{ width: '5vh', height: '5vh', padding: '1vh' }}>
    //         {currentStatistics && currentStatistics.totalexcluded || "0"}
    //     </div>
    // </div>    

    const scrollToImage = (imageName: string) => {
        const imageElement = document.querySelector(`div#${'div-' + imageName.replace(".jpg", "")}`);

        if (imageElement) {
            imageElement.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.warn("scrollToImage - Image not found", imageName);
        }
    }

    const downloadScript = async () => {
        const result = await fetchCurrentScript();
        console.log(result);

        // Create a Blob from the script content
        const blob = new Blob([result.script], { type: 'text/plain' });

        // Create a link element
        const link = document.createElement('a');

        // Set the download attribute with a filename
        link.download = 'script.txt';

        // Create a URL for the Blob and set it as the href attribute
        link.href = URL.createObjectURL(blob);

        // Append the link to the body (this step might not be necessary in modern browsers)
        document.body.appendChild(link);

        // Programmatically click the link to trigger the download
        link.click();

        // Clean up and remove the link
        link.parentNode && link.parentNode.removeChild(link);
    }

    const renderTabHeader = () => {
        /* first create a tab header for selecting images (all, included, excluded) */
        return (
            <div className="flex flex-row justify-between w-full h-10">
                <div>
                    <button
                        className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded m-2 mx-10 justify-center align-middle ${currentTab === 'all' ? 'bg-yellow-500' : ''}`}
                        style={{ width: '100px', height: '50px' }}
                        onClick={() => setCurrentTab('all')}>All</button>
                    <button
                        className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded m-2 mx-10 justify-center align-middle ${currentTab === 'included' ? 'bg-green-500' : ''}`}
                        style={{ width: '100px', height: '50px' }}
                        onClick={() => setCurrentTab('included')}>Included</button>
                    <button
                        className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded m-2 mx-10 justify-center align-middle ${currentTab === 'excluded' ? 'bg-red-500' : ''}`}
                        style={{ width: '100px', height: '50px' }}
                        onClick={() => setCurrentTab('excluded')}>Excluded</button>
                </div>
                <div>
                    <button
                        className={`bg-green-500 text-black font-bold rounded m-2 mx-10 justify-center align-middle`}
                        style={{ width: '100px', height: '50px' }}>
                        <>
                            <FontAwesomeIcon icon={faCheck} className={'bg-transparent text-black'} style={{ fontSize: '1vh' }} />
                            &nbsp;
                            {totalCounts && totalCounts.included || "0"}
                        </>
                    </button>
                    <button
                        className={`bg-red-500 text-black font-bold rounded m-2 mx-10 justify-center align-middle`}
                        style={{ width: '100px', height: '50px' }}>
                        <>
                            <FontAwesomeIcon icon={faTimes} className={'bg-transparent text-black'} style={{ fontSize: '1vh' }} />
                            &nbsp;
                            {totalCounts && totalCounts.excluded || "0"}
                        </>
                    </button>

                </div>
                <div>
                    <button
                        className={`bg-gray-300 hover:bg-gray-400 text-black font-bold rounded m-2 mx-10 justify-center align-middle ${showDetails === true ? 'bg-yellow-500' : ''}`}
                        style={{ width: '100px', height: '50px' }}
                        onClick={() => setshowDetails(!showDetails)}>
                        {'Details'}
                    </button>
                    <button
                        className={`bg-yellow-500 hover:bg-gray-400 text-black font-bold rounded m-2 mx-10 justify-center align-middle`}
                        style={{ width: '150px', height: '50px' }}
                        onClick={() => window.location.href = '/rate'}>
                        Rate Images
                    </button>
                    {isAdmin ? <button
                        className={`bg-yellow-500 hover:bg-gray-400 text-black font-bold rounded m-2 mx-10 justify-center align-middle`}
                        style={{ width: '150px', height: '50px' }}
                        onClick={() => {
                            downloadScript()
                        }}>
                        Export Script
                    </button> : null}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full">
            {renderTabHeader()}
            <div className="flex flex-wrap overflow-y-scroll mt-20"> {/* Add margin-top */}
                {renderImages()}
            </div>
        </div>
    );
};

export default ImageGallery;
