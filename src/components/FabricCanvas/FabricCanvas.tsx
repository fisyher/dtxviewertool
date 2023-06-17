import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Paper } from "@mui/material";

interface FabricCanvasProps {
  id: string;
  drawFunction: Function;
  canvasProps: {height: number, width: number, backgroundColor: string};
  triggerDraw: number;
}

const FabricCanvas: React.FC<FabricCanvasProps> = ({ id, drawFunction, canvasProps, triggerDraw }) => {
  const elementRef = useRef<HTMLCanvasElement>(null);
  const [canvasObject, setCanvasObject] = useState<fabric.StaticCanvas | null>(null);

  useEffect(() => {

    console.log("create new canvas object");
    setCanvasObject(
      new fabric.StaticCanvas(id, {
        height: canvasProps.height,
        width: canvasProps.width,
        backgroundColor: canvasProps.backgroundColor,
      })
    );

    

    return () => {
      if (!elementRef.current) {
        console.log("dispose canvas object");
        canvasObject?.dispose();
        setCanvasObject(null);
      }
    };
  }, [canvasProps, id]);

  useEffect(() => {
    drawFunction(canvasObject, triggerDraw);
  }, [canvasObject, triggerDraw, drawFunction]);

  return (<Paper sx={{py: 1}} ><canvas id={id} ref={elementRef}></canvas></Paper>);
};
//sx={{overflow: 'auto', maxHeight: 700, maxWidth: '75vw'}}
export default FabricCanvas;
