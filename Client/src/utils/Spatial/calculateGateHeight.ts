import { LINE_WIDTH, MINIMAL_BLOCKSIZE } from "../../Constants/defaultDimensions";
import { Gate } from "@Shared/interfaces";

export default function calculateGateHeight(gate:Gate, blockSize: number){
	const inputLength = gate.inputs.length;
	const outputLength = gate.outputs.length;
	const longest = inputLength > outputLength ? inputLength : outputLength;
	if(inputLength <= 1 && outputLength <= 1){
		return 2*blockSize + LINE_WIDTH/2;
	}
	return longest % 2 === 0 ? (longest * blockSize) + LINE_WIDTH/2: ((longest-1) * blockSize) + LINE_WIDTH/2;
}