import React, { useEffect, useRef } from 'react';
import { CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';

export default function BottomCanvas(){
	const bottomCanvasRef = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if(bottomCanvasRef && bottomCanvasRef.current){
			const width =  CANVAS_WIDTH;
			const height =  CANVAS_HEIGHT;
			bottomCanvasRef.current.width = width;
			bottomCanvasRef.current.height = height;
			const context = bottomCanvasRef.current.getContext('2d');
			if(!context){
				return;
			}
			context.strokeStyle = 'black';
		    context.lineWidth = 1;
		    for(let i = 0;i<width;i+=MINIMAL_BLOCKSIZE){
			    for(let j = 0; j<height; j+= MINIMAL_BLOCKSIZE){
				    context.strokeRect(i,j,1,1);
				    context.fillRect(i,j,1,1);
			    }
		    }
		}
	}, []);
	return (
		<canvas
			ref = {bottomCanvasRef}
			id = 'bottom-canvas'
			style={{
				opacity: 1,
				marginLeft: CANVAS_OFFSET_LEFT,
				position: 'absolute',
				zIndex: -1,
			}}></canvas>
	);
}