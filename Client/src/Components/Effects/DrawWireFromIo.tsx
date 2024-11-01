import React, { useEffect } from 'react';
import useDrawWire from '../../hooks/useDrawWire';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import isOnIo from '../../utils/Spatial/isOnIo';

export default function DrawWireFromIo(){
	const startDrawing = useDrawWire();
	const io = useSelector((state: RootState) => {return state.entities.currentComponent.binaryIO;});
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
    

	useEffect(() => {
		if(currentComponentId !== 'global') return;
		const handleMouseDown = (e: MouseEvent) => {
			for(const [key, io] of ioEntries){
				if(isOnIo(e.x, e.y, io)){
					startDrawing(e as unknown as React.MouseEvent<any>);
					return;
				}
			}
		};
		const ioEntries = Object.entries(io);
		document.addEventListener('mousedown', handleMouseDown);

		return () => {
			document.removeEventListener('mousedown', handleMouseDown);
		};
	}, [startDrawing, io, currentComponentId]);

	return null;
}