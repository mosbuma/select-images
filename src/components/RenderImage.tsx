import React, { useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import type { RatingStatisticsSingle } from '../tools/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'


// Define the props type
type RenderImageProps = {
    image: string;
    statistics: RatingStatisticsSingle | false;
    useHTMLImageElement: boolean;
    showCheck: boolean;
    showDetails: boolean;
}

const RenderImage: React.FC<RenderImageProps> = ({ image, statistics, useHTMLImageElement, showCheck, showDetails }) => {
    const label = image.replace(".jpg", "")

    return (
        <div className="flex flex-col items-center justify-center p-4 relative w-auto h-auto group" id={'div-' + image.replace(".jpg", "")}>
            {showDetails ? <h2 className="text-2xl font-bold mb-4 uppercase">{label}</h2> : null}
            <div>
                {
                    showDetails === true && showCheck === true && statistics !== false ?
                        <FontAwesomeIcon icon={statistics.included ? faCheck : faTimes} className={`${statistics.included ? 'bg-green-500' : 'bg-red-500'} text-black rounded-full absolute m-2 p-4`} style={{ fontSize: '1vh' }} />
                        : null}
                {useHTMLImageElement === false ?
                    <Image
                        src={`/images/nft-candidates/${image}`}
                        alt={`Showing image ${image}`}
                        layout="fill"
                        objectFit="contain"
                        onClick={() => window.location.href = `/rate/${image}`}
                    />
                    :
                    /* eslint-disable-next-line @next/next/no-img-element */
                    < img
                        src={`/images/nft-candidates/${image}`}
                        alt={`Showing image ${image}`}
                        className="object-contain w-full h-full"
                        onClick={() => window.location.href = `/rate/${image}`}
                    />
                }
            </div>
        </div >
    );
};

export default RenderImage;
