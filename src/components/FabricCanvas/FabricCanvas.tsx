import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import styled from '@emotion/styled';

interface FabricCanvasProps {
    id: string;
    drawFunction: Function;
    canvasProps: { height: number; width: number; backgroundColor: string };
    sourceObjectIndex: number;
}

interface ImageWithZoomPointerProps {
    zoomOut: boolean;
}

const ImageWithZoomPointer = styled.img`
    cursor: ${(props : ImageWithZoomPointerProps) =>
        props.zoomOut ? 'zoom-out' : 'zoom-in'};
`

const FabricCanvas: React.FC<FabricCanvasProps> = ({ id, drawFunction, canvasProps, sourceObjectIndex }) => {
    const elementRef = useRef<HTMLCanvasElement>(null);
    const imageElementRef = useRef<HTMLImageElement>(null);
    const [canvasObject, setCanvasObject] = useState<fabric.StaticCanvas | null>(null);
    const [zoomedOut, setZoomedOut] = useState<boolean>(false);

    useEffect(() => {
        console.log("create new canvas object");
        setCanvasObject(
            new fabric.StaticCanvas(id, {
                height: canvasProps.height,
                width: canvasProps.width,
                backgroundColor: canvasProps.backgroundColor
            })
        );

        return () => {
            if (!elementRef.current) {                // eslint-disable-line react-hooks/exhaustive-deps
                console.log("dispose canvas object");
                canvasObject?.dispose();
                setCanvasObject(null);
            }
        };
    }, [canvasProps, id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        drawFunction(canvasObject, sourceObjectIndex, imageElementRef.current);
    }, [canvasObject, sourceObjectIndex, drawFunction]);

    return (
        <>
            <canvas style={{display: "none"}} id={id} ref={elementRef}></canvas>
            <ImageWithZoomPointer zoomOut={!zoomedOut} ref={imageElementRef} onClick={() => {
                if(zoomedOut){
                    if(imageElementRef.current){
                        imageElementRef.current.height = imageElementRef.current.naturalHeight;
                    }
                    
                    setZoomedOut(prev => !prev);
                }
                else{
                    if(imageElementRef.current){
                        //TODO: Alot of hard-coded numbers here, need to find a way to retrieve the heights of the surrounding components programmatically instead
                        imageElementRef.current.height = window.innerHeight - (64 + 50 + 38);
                    }
                    setZoomedOut(prev => !prev);
                }
                
            }}></ImageWithZoomPointer>
        </>
    );
};
//sx={{overflow: 'auto', maxHeight: 700, maxWidth: '75vw'}}
export default FabricCanvas;
