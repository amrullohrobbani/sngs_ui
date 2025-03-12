"use client"

import React, { useContext, useEffect, useState } from 'react'
import { ImageWithBoundingBoxes } from '@/components/ImageBoundingBoxes'
import { useImage } from './player'
import { DataContext, DataItem } from '@/context/DataContext'
import { AnnotationContext } from '@/context/AnnotationContext'

export const ImagePlayer: React.FC = () => {
    const { images, currentIndex } = useImage()
    const { data } = useContext(DataContext)
    const { annotations: gtdata } = useContext(AnnotationContext)

    const [boxes, setBoxes] = useState<DataItem[]>([])
    const [boxesGT, setBoxesGT] = useState<DataItem[]>([])

    useEffect(() => {
        if (data && images[currentIndex]) {
            const frameData = data.filter(obj => obj.frame === parseInt(images[currentIndex].split('/')?.at(-1)?.split('.')[0] || '0'))
            const frameDataGT = gtdata?.filter(obj => obj.frame === parseInt(images[currentIndex].split('/')?.at(-1)?.split('.')[0] || '0'))
            if (frameData) {
                setBoxes(frameData);
                setBoxesGT(frameDataGT);
            } else {
                setBoxes([]);
                setBoxesGT([]);
            }
        }
    }, [currentIndex, data, gtdata, images])

    return (
        <div className='w-full'>
            {
                images[currentIndex]?
                <ImageWithBoundingBoxes src={images[currentIndex]} boxes={boxes} gtdata={boxesGT} currentIndex={currentIndex}/>
                :
                <ImageWithBoundingBoxes src={"/000001.png"} boxes={boxes} currentIndex={currentIndex}/>
            }
        </div>
    )
}
