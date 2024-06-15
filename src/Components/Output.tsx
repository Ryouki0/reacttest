import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
	DEFAULT_INPUT_DIM,
} from "../Constants/defaultDimensions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { BinaryInput } from "../Interfaces/BinaryInput";
import { BinaryOutput } from "../Interfaces/BinaryOutput";
import useDrawWire from "../hooks/useDrawWire";
import { AMBER, ORANGE } from "../Constants/colors";
import { BinaryIO } from "../Interfaces/BinaryIO";

interface BinaryOutputProps {
	output: BinaryIO;
	style?: React.CSSProperties | null,
}

const checkOutputStateEquality = (prev:BinaryOutput|null, next:BinaryOutput|null) => {
	if(prev?.to !== next?.to){
		return false;
	} 
	if(prev?.from !== next?.from){
		return false;
	}
	return prev?.state === next?.state;
};

export function Output({style = null, output}:BinaryOutputProps) {

	const startDrawing = useDrawWire();
	const thisOutput = useSelector((state:RootState) => {return state.entities.binaryIO[output.id]})
	const handleMouseDown = () => {
		console.log(`this output id: ${thisOutput.id.slice(0,5)}`);
		console.log(`this output position: X: ${thisOutput.position?.x} Y: ${thisOutput.position?.y}`);
	}
	// function handleMouseDown(e:React.MouseEvent<any>){
	// 	e.stopPropagation();
	// 	console.log(`this output state: ${thisOutput?.state}`);
	// 	startDrawing(e, {id: output.id, type: 'outputs', gateId: output.gateId});
	// }

	// const getStrokeWidth = () => {
	// 	if(thisOutput?.to && thisOutput.to.length > 0){
	// 		return 12;
	// 	}
	// 	if(thisOutput?.from){
	// 		return 12;
	// 	}
	// 	return 100;
	// };

	// const getPathColor = () => {
	// 	if(thisOutput?.state){
	// 		return 'red';
	// 	}
	// 	if(thisOutput?.to){
	// 		return AMBER;
	// 	}
	// 	if(thisOutput?.from){
	// 		return AMBER
	// 	}
	// 	return 'black';
	// };
	return (
		<>
			<div style={{...style,
				width: DEFAULT_INPUT_DIM.width,
				height: DEFAULT_INPUT_DIM.height,
			}}
			onMouseDown={e => {handleMouseDown()}}>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: 'black',
						pathColor: 'black',
					})}
					strokeWidth={12}
				></CircularProgressbar>
			</div>
		</>
	);
}
