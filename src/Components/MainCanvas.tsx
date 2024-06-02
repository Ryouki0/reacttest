import React from 'react';
import { useDispatch } from 'react-redux';
import useDrawWire from '../hooks/useDrawWire';
import useRedrawCanvas from '../hooks/useRedrawCanvas';
import { CANVAS_OFFSET_LEFT, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import useIsWireClicked from '../hooks/useIsWireClicked';
import { throttle } from '../utils/throttle';
import { Wire } from '../Interfaces/Wire';
import { setHoveringOverWire, setSelectedEntity } from '../state/mouseEventsSlice';
import { breakWirePath, removeWire } from '../state/objectsSlice';

export default function MainCanvas(){
	const canvasRef = useRedrawCanvas();
	const checkWire = useIsWireClicked();
	const startDrawing = useDrawWire();
	const dispatch = useDispatch();
	const throttledCheckWire = throttle((x:number, y:number) => {
		const wire = checkWire(x,y);
		if(!wire){
			dispatch(setHoveringOverWire(null));
			return;
		}
		dispatch(setHoveringOverWire(wire));
	}, 16);

	const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
		e.preventDefault(); 
		const wire = checkWire(e.pageX, e.pageY);
		if(!wire){
			return;
		}
		console.log(`need to break wire: ${wire.id.slice(0,5)}`);
		dispatch(breakWirePath(wire));
	}

	const drawWireFromWire = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
		if(e.button !== 0){
			return;
		}
		e.preventDefault();
		const wire = checkWire(e.pageX, e.pageY);
		if(!wire){
			return;
		}
		dispatch(setSelectedEntity({type:'Wire', entity: wire}));
		// wire.wirePath.forEach(w => {
		// 	console.log(`${w.slice(0,6)}`);
		// })
		startDrawing(e, wire.from, wire);
	}

	return (
		<>
			<canvas
				id="main-canvas"
				ref={canvasRef}
				onMouseDown={e => {drawWireFromWire(e)}}
				onMouseMove={e => {throttledCheckWire(e.pageX,e.pageY)}}
				onContextMenu={e => {handleContextMenu(e)}}
				style={{
					backgroundColor: 'rgb(100 100 100 / 30%) ',
					marginLeft: CANVAS_OFFSET_LEFT,
					position: 'absolute',
					zIndex: 0,
				}}
			>
        asd
			</canvas>
		</>
	);
}