import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { CustomGate } from './CustomGate';
import { DEFAULT_GATE_DIM, getClosestBlock } from '../Constants/defaultDimensions';
import { addGate, changeBluePrintPosition } from '../state/slices/entities';
import { setSelectedGateId } from '../state/slices/mouseEvents';
import { create } from 'domain';
import calculateGateHeight from '../utils/Spatial/calculateGateHeight';
import { ReadSyncOptions } from 'fs';

export default function SelectedGate(){
	const selectedGateId = useSelector((state: RootState) => {return state.mouseEventsSlice.selectedGate;});
	const currentGate = useSelector((state: RootState) => {return state.entities.bluePrints.gates[selectedGateId!];});
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const dispatch = useDispatch();
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});

	const handleMouseMove = (e: MouseEvent) => {
		if(!currentGate){
			return;
		}
		const gateWidth = DEFAULT_GATE_DIM.width;
		const gateHeight = calculateGateHeight(currentGate, blockSize);
		const middleX = (e.x - gateWidth / 2) - cameraOffset.x;
		const middleY = (e.y - gateHeight / 2) - cameraOffset.y;
		const {roundedX, roundedY} = getClosestBlock(middleX, middleY, blockSize);
		//console.log(`x:${roundedX}`)
		if(roundedX !== currentGate?.position?.x || roundedY !== currentGate.position?.y){
			dispatch(changeBluePrintPosition({gateId: currentGate!.id, position: {x:roundedX, y:roundedY}, blockSize: blockSize, ioRadius}));
		}
	};

	const createGate = (e: MouseEvent) => {
		if(e.button === 0 && currentGate){
			e.stopPropagation();
			dispatch(addGate(currentGate));
		}
	};

	const removeSelectedGate = (e: MouseEvent) =>{
		e.preventDefault();
		dispatch(setSelectedGateId(null));
	};

	useEffect(() => {
		if(currentGate){
			document.addEventListener('mousedown', createGate);
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('contextmenu', removeSelectedGate);
		}

		return () => {
			document.removeEventListener('mousedown', createGate);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('contextmenu', removeSelectedGate);
		};
	}, [currentGate]);

	return <>
		<div style={{
			position: 'absolute', 
			width: '100%', 
			height: '100%', 
			transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`, 
			pointerEvents: 'none',
			'--block-size': `${blockSize}px`,
			'--io-radius': `${ioRadius}px`} as React.CSSProperties}>
			{currentGate && <CustomGate gateId={currentGate?.id} isBluePrint={true} position={'absolute'}></CustomGate>}

		</div>
	</>;
}