import { PayloadAction, createSlice, current } from "@reduxjs/toolkit";
import { Wire } from "../../Interfaces/Wire";
import { Gate } from "../../Interfaces/Gate";
import { BinaryInput } from "../../Interfaces/BinaryInput";
import {v4 as uuidv4} from 'uuid';

import { BinaryIO } from "../../Interfaces/BinaryIO";
import { propagateIoStateChange } from "../../utils/clock";


const ANDInputId1 = uuidv4();
const ANDInputId2 = uuidv4();
const DELAYInputId1 = uuidv4();
const ANDOutputId1 = uuidv4();
const NOInputId1 = uuidv4();
const NOOutputId1 = uuidv4();
const DELAYOutputId1 = uuidv4();
const ANDId = uuidv4();
const NOId = uuidv4();
const DELAYId = uuidv4();
export interface entities{
    wires: {[key: string]: Wire};
    gates: {[key: string]: Gate};
	bluePrints: {gates: {[key: string]:Gate}, io: {[key: string]: BinaryIO}};
	binaryIO: {[key: string]:BinaryIO}
}

const initialState = {wires: {}, gates: {}, bluePrints: {gates: {
	[ANDId]: {
		name: 'AND',
		parent: 'global',
		inputs: [ANDInputId1, ANDInputId2],
		outputs: [ANDOutputId1],
		id: ANDId
	},
	[NOId]: {
		name: 'NO',
		parent: 'global',
		inputs: [NOInputId1],
		outputs: [NOOutputId1],
		id: NOId
	},
	[DELAYId]: {
		name: 'DELAY',
		parent: 'global',
		inputs: [DELAYInputId1],
		outputs: [DELAYOutputId1],
		id: DELAYId,
		nextTick: 0,
	}
}, 
	io: {
		[ANDInputId1]: {
			id: ANDInputId1,
			gateId: ANDId,
			parent: 'global',
			to: [],
			type: 'input',
			state: 0,
			isGlobalIo: false,
			style: {},
		},
		[ANDInputId2]: {
			id: ANDInputId2,
			gateId: ANDId,
			to: [],
			parent: 'global',
			state: 0,
			isGlobalIo: false,
			type: 'input',
			style: {},
		},
		[ANDOutputId1]: {
			id: ANDOutputId1,
			parent: 'global',
			gateId: ANDId,
			state: 0,
			to: [],
			isGlobalIo: false,
			type: 'output',
			style: {},
		},
		[NOInputId1]: {
			id: NOInputId1,
			parent: 'global',
			gateId: NOId,
			state: 0,
			to: [],
			isGlobalIo: false,
			type: 'input',
			style: {},
		},
		[NOOutputId1]: {
			id: NOOutputId1,
			parent: 'global',
			state: 0,
			gateId: NOId,
			to: [],
			isGlobalIo: false,
			type: 'output',
			style: {},
		},
		[DELAYInputId1]: {
			id: DELAYInputId1,
			state: 0,
			parent: 'global',
			gateId: DELAYId,
			to: [],
			isGlobalIo: false,
			type: 'input',
			style: {},
		},
		[DELAYOutputId1]: {
			id: DELAYOutputId1,
			state: 0,
			gateId: DELAYId,
			to: [],
			parent: 'global',
			isGlobalIo: false,
			type: 'output',
			style: {},
		}
	}}, 
	binaryIO: {}
} as entities;

const entities = createSlice({
	name: 'entities',
	initialState: initialState,
	reducers: {
		addWire: (state, action: PayloadAction<Wire>) => {
			state.wires[action.payload.id] = action.payload;
		},
		changeWirePosition: (state,action:PayloadAction<Wire>) => {
			if(state.wires[action.payload.id]){
				state.wires[action.payload.id].diagonalLine = action.payload.diagonalLine;
				state.wires[action.payload.id].linearLine = action.payload.linearLine;
			}else{
				state.wires[action.payload.id] = {...action.payload};
			}
		},
		/**
		 * Adds a gate to the state.
		 * 
		 * Copy the blueprint into the state 1:1
		 * then change the IDs of every gate and IO in the actual state 
		 */
		addGate: (state, action: PayloadAction<Gate>) => {
			/**
			 * Copies a gate into the state, top level only
			 * @param gate The gate to copy
			 */
			function copyGateIntoState(gate: Gate){
				state.gates[gate.id] = JSON.parse(JSON.stringify(gate));
				gate.inputs.forEach(inputId => {
					state.binaryIO[inputId] = JSON.parse(JSON.stringify(state.bluePrints.io[inputId]));
				})
				gate.outputs.forEach(outputId => {
					state.binaryIO[outputId] = JSON.parse(JSON.stringify(state.bluePrints.io[outputId]));
				})
			}

			function copyBluePrintIntoState(gateId: string){
				const mainGate = state.bluePrints.gates[gateId];
				copyGateIntoState(mainGate);

				mainGate.gates?.forEach(gateId => {
					const gate = state.bluePrints.gates[gateId];
					
					if(gate.gates){
						copyBluePrintIntoState(gate.id);
					}else{
						copyGateIntoState(gate);
					}
				})
			}

			/**
			 * Replace the IDs of a gate, and it's IO's; and change the "to" and "from" of the connected IOs.
			 * @param gate The gate to replace
			 */
			function replaceIdsInGate(gate:Gate, parentId: string){
				const newGateId = uuidv4();
				state.gates[newGateId] = {...gate, id: newGateId, inputs: [], outputs: [], position: {x: 120, y: 210}};

				/**
				 * Replace the gate ID in the parent gate, and add the parent gateId as the parent in this gate
				 */
				if(parentId !== 'global'){
					const prevGateIdx = state.gates[parentId].gates?.findIndex(gateId => gateId === gate.id);
					if(prevGateIdx === undefined || prevGateIdx === -1){
						throw new Error(`The parent gate doesn't contain the child gate ID.  ${gate.id}`);
					}
					state.gates[parentId].gates![prevGateIdx] = newGateId;
					state.gates[newGateId].parent = parentId;
					console.log(`GATE: ${gate.name} replaced the gateId from: ${gate.id} \nto: ${state.gates[parentId].gates![prevGateIdx].slice(0,5)}`);
				}
				/**
				 * Create the new inputs
				 */
				gate.inputs.forEach(inputId => {
					const newInputId = uuidv4();
					const prevInput = state.binaryIO[inputId];
					state.binaryIO[newInputId] = {...prevInput, id: newInputId, gateId: newGateId, parent: parentId};
					const from = state.binaryIO[prevInput.from?.id!];
					if(from){
						const idxOfThisInput = from.to?.findIndex(to => to.id === prevInput.id);
						if(idxOfThisInput !== undefined && idxOfThisInput !== -1){
							from.to![idxOfThisInput] = {id: newInputId, gateId: newGateId, type: from.to![idxOfThisInput].type};
						}
					}
					console.log(`Changed input from: ${prevInput.id} to: ${newInputId.slice(0,5)} input is from: ${from?.id}`);
					prevInput.to?.forEach(to => {
						const toIo = state.binaryIO[to.id];
						toIo.from = {id: newInputId, gateId: newGateId, type: toIo.from?.type!};
					})
					state.gates[newGateId].inputs.push(newInputId);
					delete state.binaryIO[inputId];
				})

				gate.outputs.forEach(outputId => {
					const newOutputId = uuidv4();
					const prevOutput = state.binaryIO[outputId];
					prevOutput.to?.forEach(to => {
						const toIo = state.binaryIO[to.id];
						if(!toIo){
							Object.entries(state.binaryIO).forEach(([key, io]) => {
								console.log(`WHOLE STATE: ${key}`);
							})
							throw new Error(`No IO at ID: ${to.id}\nWhen prevOutput is: ${prevOutput.id} and gate is: ${gate.name} gateId: ${gate.id}`);
						}
						toIo.from = {id: newOutputId, gateId: newGateId, type: toIo.from?.type!};
					})
					const from = state.binaryIO[prevOutput.from?.id!];
					if(from){
						const idxOfThisInput = from.to?.findIndex(to => to.id === prevOutput.id);
						if(idxOfThisInput !== undefined && idxOfThisInput !== -1){
							from.to![idxOfThisInput] = {id: newOutputId, gateId: newGateId, type: from.to![idxOfThisInput].type};
						}
					}
					state.gates[newGateId].outputs.push(newOutputId);
					state.binaryIO[newOutputId] = {...prevOutput, id: newOutputId, gateId: newGateId, parent: parentId};
					delete state.binaryIO[outputId];
				})
				//console.log(`prev Gate ID: ${gate.id.slice(0,5)}   next gate ID: ${newGateId.slice(0,5)}`);
				
				delete state.gates[gate.id];
				return newGateId;
			}

			/**
			 * Replaces the IDs in a component any layer deep
			 * @param gateId The main gate ID
			 * @param parent The parent if it has, else 'global'
			 */
			function replaceGatesRecursively(gateId: string, parent: string){
				const mainGate = state.gates[gateId];
				console.log(`MAINGATE: ${mainGate.name} ${mainGate.id.slice(0,6)} parent: ${parent}`);
				const newMainGateId = replaceIdsInGate(mainGate, parent);
				mainGate.gates?.forEach(gateId => {
					const currentGate = state.gates[gateId];
					if(!currentGate){
						// Object.entries(state.gates).forEach(([key, gate]) => {
						// 	console.log(`THE STATE: ${gate.id.slice(0,6)} ${gate.name}`);
						// })
						// Object.entries(state.bluePrints.gates).forEach(([key, bluePrint]) => {
						// 	console.log(`THE BLUEPRINTS: ${bluePrint.id.slice(0,6)} ${bluePrint.name}`)
						// })
						mainGate.gates?.forEach(gateId => {
							console.log(`Gate IDS: ${gateId}`);
						})
						throw new Error(`No gate in the state at ID: ${gateId} \n parent: ${parent} mainGate: ${mainGate.name}`);
					}
					if(currentGate.gates){
						replaceGatesRecursively(currentGate.id, newMainGateId);
					}else{
						replaceIdsInGate(currentGate, newMainGateId);
					}
				})
			}

			copyBluePrintIntoState(action.payload.id);
			const gateIds: string[] = [];
			Object.entries(state.gates).forEach(([key, gate]) => {
				gateIds.push(key);
			})
			console.log(`${gateIds.join(' ')}`)
			Object.entries(state.binaryIO).forEach(([key,io]) => {
				console.log(`${io.type}  ${key} is going to: ${io.to?.[0]?.id} and coming from: ${io.from?.id}`);
			})
			replaceGatesRecursively(action.payload.id, 'global');
			
		},
		
		changeGatePosition: (state, action: PayloadAction<{gate:Gate,position: {x:number,y:number}}>) => {
			state.gates[action.payload.gate.id].position = action.payload.position;
		},
		addInput: (state, action:PayloadAction<BinaryIO>) => {
			const inputs = Object.entries(state.binaryIO);
			for(const [key, input] of inputs){
				if(input.type === 'input' && !input.gateId){
					if(input.position?.y === action.payload.position?.y){
						return;
					}
				}
			}
			state.binaryIO[action.payload.id] = action.payload;

		},
		changeInputState: (state, action:PayloadAction<string>) => {
			console.log(`changing input state at: ${action.payload}`);
			const newState = state.binaryIO[action.payload].state ? 0 : 1;
			state.binaryIO[action.payload].state = newState;
			
			state.binaryIO = propagateIoStateChange(action.payload, state.binaryIO);
			state.binaryIO[action.payload].to?.forEach(to => {
				console.log(`connected to : ${to.id.slice(0,5)}`);
				const otherIo = state.binaryIO[to.id];
				otherIo.to?.forEach(to => {console.log(`other: ${to.id}`)})
			})
		},
		addGlobalOutput: (state, action: PayloadAction<BinaryIO>) => {
			const ioEntries = Object.entries(state.binaryIO);
			for(const [key, io] of ioEntries){
				if(io.type === 'output' && !io.gateId){
					if(io.position?.y === action.payload.position?.y){
						return;
					}
				}
			}
			state.binaryIO[action.payload.id] = action.payload;
		},
		changeIOPosition: (state, action:PayloadAction<{id: string, position: {x:number, y:number}}>) => {
			state.binaryIO[action.payload.id].position = action.payload.position;
		},
		setConnections: (state, action:PayloadAction<{connections: {wireTree: string[], outputs: string[], sourceId: string|null}[]}>) => {
			const connections = action.payload.connections;
			const ioEntires = Object.entries(state.binaryIO).filter(([key, io]) => io.parent === 'global');
			const wireEntries = Object.entries(state.wires);
			
			for(const [key, io] of ioEntires){
				if((io.type === 'output' && !io.isGlobalIo) 
					|| (io.type === 'input' && io.isGlobalIo && !io.gateId) 
					|| (io.type === 'output' && io.isGlobalIo && io.gateId)){
					io.to = [];
				}else if((io.type === 'input' && !io.isGlobalIo) 
					|| (io.type === 'output' && io.isGlobalIo && !io.gateId) 
					|| (io.type === 'input' && io.isGlobalIo && io.gateId)){
					io.from = null;
					io.state = 0;
					if(io.to!.length > 0){
						state.binaryIO = propagateIoStateChange(io.id, state.binaryIO);
					}
				}
			}
			for(const [key, wire] of wireEntries){
				state.wires[key].from = null;
			}
			connections.forEach(connection => {
				const source = state.binaryIO[connection.sourceId!];
				if(source){
					source.to = [];
				}

				connection.wireTree.forEach(wireId => {
					state.wires[wireId].from = source ? {id: source.id, gateId: source.gateId, type: source.type} : null;
				})
				connection.outputs.forEach(outputId => {
					const output = state.binaryIO[outputId];
					output.from = source ? {id: source.id, gateId: source.gateId, type: source.type} : null;
					output.state = source?.state ?? 0;
					state.binaryIO = propagateIoStateChange(output.id, state.binaryIO);
					if(source){
						source.to?.push({id: output.id, gateId: output.gateId, type: output.type});
					}
				})
				
			})
		},
		deleteWire: (state, action:PayloadAction<string>) => {
			delete state.wires[action.payload];
		},
		deleteComponent: (state, aciton: PayloadAction<string>) => {
			const component = state.gates[aciton.payload];
			function deleteBaseGate(gateId: string){
				const gate = state.gates[gateId];
				gate.inputs.forEach(inputId => {
					delete state.binaryIO[inputId];
				})
				gate.outputs.forEach(outputId => {
					delete state.binaryIO[outputId];
				})
				delete state.gates[gateId];
			}
			if(!component.gates){
				deleteBaseGate(component.id);
			}
		},
		updateState: (state, action: PayloadAction<{gates: {[key: string]: Gate}, binaryIO: {[key: string] :BinaryIO}}>) => {
			state.binaryIO = action.payload.binaryIO;
			state.gates = action.payload.gates;
		},
		
		createBluePrint: (state, action: PayloadAction<{name: string}>) => {
			const gateEntries = Object.entries(state.gates);
			const ioEntries = Object.entries(state.binaryIO);
			const topLevelGates = gateEntries.reduce((acc:{[key: string]: Gate}, [key, gate]: [string, Gate]) => {
				if(gate.parent === 'global'){
					acc[key] = gate;
				}
				return acc;
			}, {})
			const globalInputs = ioEntries.map(([key, io]) => {if(io.isGlobalIo && !io.gateId && io.type === 'input'){
				return io;
			}}).filter((io) => io !== undefined) as Exclude<typeof ioEntries[0][1], undefined>[];

			const globalOutputs = ioEntries.map(([key, io]) => io.isGlobalIo && !io.gateId && io.type === 'output' ? io : undefined)
			.filter(io => io !== undefined) as Exclude<typeof ioEntries[0][1], undefined>[];

			const newGateId = uuidv4();
			const newGate:Gate = {
				gates: [...Object.entries(topLevelGates).map(([key, gate]) => key)],
				name: action.payload.name,
				id: newGateId,
				parent: 'global',
				inputs: [...globalInputs.map(input => input.id)],
				outputs: [...globalOutputs.map(output => output.id)]
			}
			state.bluePrints.gates[newGateId] = newGate;
			
			globalInputs.forEach(input => {
				input.to?.forEach(to => {
					console.log(`global input to: ${to.id}`);
				})
			})

			gateEntries.forEach(([key, gate]) => {
				state.bluePrints.gates[key] = {...gate, parent: newGateId};
			})
			ioEntries.forEach(([key, io]) => {
				state.bluePrints.io[key] = {...io, parent: newGateId};
			})

			globalOutputs.forEach(output => {
				state.bluePrints.io[output.id].gateId = newGateId;
				
			})
			globalInputs.forEach(input => {
				state.bluePrints.io[input.id].gateId = newGateId;
				
			})
			state.gates = {};
			state.binaryIO = {};
			state.wires = {};
		}
	}
});
export default entities.reducer;
export const {addWire, 
	changeWirePosition, 
	addGate,
	changeGatePosition,
	addInput,
	changeInputState,
	addGlobalOutput,
	changeIOPosition,
	setConnections,
	deleteWire,
	deleteComponent,
	updateState,
	createBluePrint} = entities.actions;
// const entities = createSlice({
// 	name: 'entities',
// 	initialState: initialState,
// 	reducers: {
// 		addWire: (state, action: PayloadAction<Wire>) => {
// 			state.wires[action.payload.id] = (action.payload);
// 		},
// 		changeWirePosition: (state, action: PayloadAction<Wire>) => {
// 			if(state.wires[action.payload.id]){
// 				state.wires[action.payload.id].diagonalLine = action.payload.diagonalLine;
// 				state.wires[action.payload.id].linearLine = action.payload.linearLine;
// 			}else{
// 				state.wires[action.payload.id] = {...action.payload};
// 			}
// 		},
// 		breakWirePath: (state, action: PayloadAction<Wire>) => {
// 			let from:BinaryOutput | BinaryInput |null = null;
// 			if(action.payload.from){
// 				if(action.payload.from.gateId){
// 					from = state.gates[action.payload.from.gateId].outputs[action.payload.from.id];
// 				}else{
// 					from = state.globalInputs[action.payload.from.id];
// 				}
// 			}
			

// 			const connectedTo: (BinaryInput | BinaryOutput)[] = [];
		
// 			from?.to?.forEach(to => {
				
// 				if(to.gateId){
// 					connectedTo.push(state.gates[to.gateId].inputs[to.id]);
// 					//console.log(`${state.gates[to.gateId].inputs[to.id].id.slice(0,5)}`);
// 				}else{
// 					connectedTo.push(state.globalOutputs[to.id]);
// 				}
// 			});

// 			//For every connected input check if the wirePaths contain the wire that will be removed, if it is contained, 
// 			//then break the connection.
// 			//It won't break the wires if they are not connected to something.
// 			connectedTo.forEach(to => {
// 				const wirePath = to.wirePath;
// 				if(!wirePath){
// 					return;
// 				}
// 				if(wirePath.includes(action.payload.id)){
// 					const wireIdx = wirePath.indexOf(action.payload.id);
// 					const lastWireIdxInPath = wirePath[wirePath.length-1];
// 					const lastWireInPath = state.wires[lastWireIdxInPath];

// 					({
// 						gates:state.gates,
// 						globalInputs: state.globalInputs,
// 						globalOutputs: state.globalOutputs,
// 					} = disconnectByWire(state.gates, lastWireInPath, state.globalInputs, to.id, state.globalOutputs));
// 					for(let i = wireIdx+1; i<wirePath?.length;i++){
// 						state.wires[wirePath[i]].wirePath = state.wires[wirePath[i]].wirePath.slice(wireIdx+1);
// 						state.wires[wirePath[i]].from = null;
// 						if(i === wirePath.length-1){
// 							to.wirePath = state.wires[to.wirePath?.[i]??'']?.wirePath;
							
// 						}
// 					}
// 					for(let i = 0; i<wireIdx;i++){
// 						if(state.wires[wirePath[i]].wirePathConnectedTo){
// 							//This will not work if there are more gates connected directly to the last wire
// 							const idx = state.wires[wirePath[i]].wirePathConnectedTo?.findIndex(to => to.id === lastWireInPath.connectedToId?.[0].id);
// 							if(idx !== -1 && idx !== undefined){
// 								state.wires[wirePath[i]].wirePathConnectedTo?.splice(idx, 1);
// 							}
// 						}
// 					}
// 				}
// 			});

// 			//For wires that are not connected to anything
// 			Object.entries(state.wires).forEach(([key, wire]) => {
// 				const wireIdx = wire.wirePath.findIndex(wireId => wireId === action.payload.id);
// 				if(wireIdx === -1){
// 					return;
// 				}
// 				wire.wirePath = wire.wirePath.slice(wireIdx+1);
// 				wire.from = null;
// 			});

// 			delete state.wires[action.payload.id];
// 		},
// 		removeWire: (state, action: PayloadAction<Wire>) => {
// 			if(!(state.wires[action.payload.id])){
// 				throw new ReferenceError(`No wire with id: ${action.payload.id}`);
// 			}
// 			if(action.payload.connectedToId){
// 				action.payload.connectedToId.forEach(connectedTo => {
// 					({
// 						gates: state.gates, 
// 						globalInputs: state.globalInputs,
// 						globalOutputs: state.globalOutputs
// 					} = disconnectByWire(state.gates, action.payload, state.globalInputs, connectedTo.id, state.globalOutputs));
// 				});
// 			}
// 			delete state.wires[action.payload.id];
// 		},
// 		addGate: (state, action: PayloadAction<Gate>) => {
// 			state.gates[action.payload.id] = action.payload;
// 			Object.entries(state.gates[action.payload.id].outputs).forEach(([key,output]) => {
// 				console.log(`In state output.from? : ${output.from?.id.slice(0,5)}`);
// 			})
// 		},
// 		changeGate: (state, action: PayloadAction<{gate: Gate, newPos: {x:number, y:number}}>) => {
// 			state.gates[action.payload.gate.id].position = {...action.payload.newPos};
// 		},
// 		//TODO: Disconnect the inputs and outputs from the wires, then remove gate
// 		removeGate: (state, action: PayloadAction<string>) => {
// 			const gate = state.gates[action.payload];
// 			if(!gate){
// 				return;
// 			}
// 			const inputEntries = Object.entries(gate.inputs);
// 			const outputEntries = Object.entries(gate.outputs);
// 			//Disconnect the inputs from the output/globalInput they are connected from
// 			for(const [key, input] of inputEntries){
// 				state.wires = removeWireTo(state.wires, key);
// 				if(input.from?.gateId){
// 					const toIdx = state.gates[input.from.gateId][input.from.type][input.from.id].to?.findIndex(to => to.id === key);
// 					if(toIdx !== undefined && toIdx !== -1){
// 						state.gates[input.from.gateId][input.from.type][input.from.id].to?.splice(toIdx, 1);
// 					}
// 				}else if(input.from){
// 					const toIdx = state.globalInputs[input.from.id]?.to?.findIndex(to => to.id === key);
// 					if(toIdx !== undefined && toIdx !== -1){
// 						state.globalInputs[input.from.id].to?.splice(toIdx, 1);
// 					}
// 				}
// 			}
			
// 			for(const [key, output] of outputEntries){
// 				state.wires = removeWiresFrom(state.wires, key);
// 				if(output.to){
// 					output.to?.forEach(to => {
// 						if(to.gateId){
// 							state.gates[to.gateId].inputs[to.id].from = null;
// 						}
// 						else{
// 							state.globalOutputs[to.id].from = null;
// 						}
// 					});
// 				}
// 			}
// 			delete state.gates[action.payload];
// 		},
// 		addCurrentInput: (state, action: PayloadAction<BinaryInput>) => {
// 			state.globalInputs[action.payload.id] = action.payload;
// 		},
// 		changeInputState: (state, action: PayloadAction<BinaryInput>) => {
// 			const newState = action.payload.state === 1 ? 0 : 1;
// 			state.globalInputs[action.payload.id].state = newState;
// 			if(state.globalInputs[action.payload.id].to){
// 				state.globalInputs[action.payload.id].to?.forEach(to => {
// 					if(to.gateId){
// 						//console.log(`to: ${to.id}`);
// 						state.gates[to.gateId].inputs[to.id].state = newState;
// 					}
// 				});
// 			}
// 		},
// 		changeInputPosition: (state, action: PayloadAction<{x:number,y:number, gateId: string}>) => {
// 			const { gateId } = action.payload;
//     		const gate = state.gates[gateId];

//     		if (gate) {
//        			Object.keys(gate.inputs).forEach((key, idx, array) => {
// 					let newY = 0;
//             	if(gate.position?.y){
// 						newY = gate.position.y + calculateInputTop(idx, array.length) + DEFAULT_INPUT_DIM.height/2 + (idx*DEFAULT_INPUT_DIM.height);
					
// 					}
//             	const newX = gate.position?.x ?? 0;
            
//             	gate.inputs[key].position = { x: newX, y: newY };
//         		});
//    			}	
// 		},
// 		addWireToGateInput: (state, action: PayloadAction<{gate:Gate,inputId:string, wire:Wire}>) => {
// 			const gate = state.gates[action.payload.gate.id];
// 			const wire = state.wires[action.payload.wire.id];
// 			const wireId = action.payload.wire.id;
// 			const inputId = action.payload.inputId;
// 			const wireFrom = wire.from;
// 			if(!wireFrom){
// 				console.warn(`no wirefrom when connecting`);
// 				return;
// 			}
// 			if(!gate){
// 				throw new ReferenceError(`Gate with ${action.payload.gate.id} not found`);
// 			}
// 			//Give the IDs to the input
// 			if(gate.inputs[inputId].from && gate.inputs[inputId].from?.id !== wireFrom.id){
// 				console.warn(`Possible short circuit (wires with different sources connected to the same input)`);
// 				state.wires[wireId].error = true;
// 				return;
// 			}else{
// 				gate.inputs[action.payload.inputId].from = action.payload.wire.from;
// 				gate.inputs[action.payload.inputId].wirePath = action.payload.wire.wirePath;
// 			}
			
// 			//Change the inputs state to the "from" state when connecting
// 			if(wireFrom.gateId){
// 				gate.inputs[inputId].state = state.gates[wireFrom.gateId][wireFrom.type][wireFrom.id].state;
// 				if(gate.gates){

// 				}
// 			}else{
// 				gate.inputs[inputId].state = state.globalInputs[wireFrom.id].state;
// 			}
			
// 			//Add "to" to gates output/globalInput
// 			if(wire.from?.gateId){
// 				if(state.gates[wire.from.gateId][wire.from.type][wire.from.id].to){
// 					state.gates[wire.from.gateId][wire.from.type][wire.from.id].to?.push({id: inputId, type: 'inputs', gateId: gate.id});
// 				}else{
// 					state.gates[wire.from.gateId][wire.from.type][wire.from.id].to = [{id: inputId, type: 'inputs', gateId: gate.id}];
// 				}
// 			}else{
// 				if(!state.globalInputs[wireFrom.id].to){
// 					state.globalInputs[wireFrom.id].to = [{id:inputId, type: 'inputs', gateId: gate.id}];
// 				}else{
// 					state.globalInputs[wireFrom.id].to?.push({id: inputId, type:'inputs', gateId: gate.id});
// 				}
// 			}

// 			//Add the new ID to the wire
// 			const wireConnectedTo = state.wires[wireId].connectedToId;
// 			if(!wireConnectedTo){
// 				state.wires[wireId].connectedToId = [{id:inputId, type:'inputs', gateId: gate.id}];
// 			}else{
// 				state.wires[wireId].connectedToId.push({id:inputId, type:'inputs',gateId: gate.id});
// 				for(let i = 0;i<wire.wirePath.length;i++){
// 					if(state.wires[wire.wirePath[i]].wirePathConnectedTo){
// 						state.wires[wire.wirePath[i]].wirePathConnectedTo?.push({id:inputId, type: 'inputs', gateId: gate.id});
// 					}else {
// 						state.wires[wire.wirePath[i]].wirePathConnectedTo = [{id: inputId, type: 'inputs', gateId: gate.id}];
// 					}
// 				}
// 			}
// 			// for(let i =0;i<wire.wirePath.length;i++){
// 			// 	console.log(`connectedTo: ${state.wires[wire.wirePath[i]].connectedToId[0].id.slice(0,6)}`);
// 			// }
// 		},
// 		disconnectWireFromGate: (state, action: PayloadAction<{gateId:string, inputId:string, wireId:string}>) => {
// 			const gate = state.gates[action.payload.gateId];
// 			const wire = state.wires[action.payload.wireId];

			
// 			gate.inputs[action.payload.inputId].from = null;
// 			({
// 				gates: state.gates,
// 				globalInputs: state.globalInputs,
// 				globalOutputs: state.globalOutputs
// 			} = disconnectByWire(state.gates, wire, state.globalInputs, action.payload.inputId, state.globalOutputs));
// 			if(wire.connectedToId){
// 				state.wires = removeWireTo(state.wires, action.payload.inputId);
// 			}
// 		},
// 		disconnectWireFromGlobalOutput: (state, action: PayloadAction<{wireId: string, outputId: string}>) => {
// 			const wire = state.wires[action.payload.wireId];
// 			const fromGate = state.gates[wire.from?.gateId??''];
// 			if(!fromGate){
// 				return;
// 			}
// 			if(!wire){
// 				return;
// 			}

// 			(
// 				{
// 					gates: state.gates,
// 					globalInputs: state.globalInputs,
// 					globalOutputs: state.globalOutputs
// 				} = disconnectByWire(state.gates,wire,state.globalInputs, action.payload.outputId, state.globalOutputs)
// 			);
// 			state.wires = removeWireTo(state.wires, action.payload.outputId);

// 		},
// 		addGlobalOutput: (state, action: PayloadAction<BinaryOutput>) => {
// 			state.globalOutputs[action.payload.id] = action.payload;
// 		},
// 		connectToGlobalOutput: (state, action: PayloadAction<{wireId: string, outputId: string}>) => {
// 			const wire = state.wires[action.payload.wireId];
// 			const outputId = action.payload.outputId;
// 			const gate = state.gates[wire.from?.gateId??''];
// 			if(!wire || !gate || !wire.from){
// 				return;
// 			}
			
// 			//Add the output reference to the gate
// 			if(gate.outputs[wire.from.id].to){
// 				gate.outputs[wire.from.id].to?.push({type:'outputs', id:outputId, gateId: null});
// 			}else{
// 				gate.outputs[wire.from.id].to = [{type:'outputs', id:outputId, gateId: null}];
// 			}

// 			state.globalOutputs[outputId].from = wire.from;
// 			state.globalOutputs[outputId].wirePath = wire.wirePath;
// 			if(wire.connectedToId){
// 				wire.connectedToId.push({type: 'outputs', gateId: null, id: outputId});
// 			}else{
// 				wire.connectedToId = [{type: 'outputs', gateId: null, id: outputId}];
// 			}
// 		},
// 		connectWireToWire: (state, action: PayloadAction<{wire1:Wire, wire2:Wire}>) => {
// 			const wire1 = state.wires[action.payload.wire1.id];
// 			const wire2 = state.wires[action.payload.wire2.id];
// 			let fromWire:Wire;
// 			let toWire:Wire;
// 			if(wire1.from){
// 				fromWire = wire1;
// 				toWire = wire2;
// 			}else{
// 				fromWire = wire2;
// 				toWire = wire1;
// 			}
// 			if(wire1.from && wire2.from){
// 				wire1.error = true;
// 				wire2.error = true;
// 				return;
// 			}
// 			const from = fromWire.from;
// 			const wireTree:Wire[] = [];
// 			Object.entries(state.wires).forEach(([key, wire]) => {
// 				if(wire.wirePath.includes(toWire.wirePath[0])){
// 					wireTree.push(wire);
// 				}
// 			});

// 			//Start with the "toWire" and check each wire's endpoints in the wiretree to see if they are connected,
// 			//if they are, add them to the "wires" list, and check the wires with respect to that wire.
// 			const traversedWires: Set<string> = new Set();
// 			const wires:Wire[] = [toWire];

// 			const connections: {[key:string]: string} = {};
// 			toWire.from = fromWire.from;
// 			toWire.wirePath = [...fromWire.wirePath, toWire.id];
// 			while (wires.length > 0) {
// 				const currentWire = wires.pop();
// 				if (!currentWire) continue;
			
// 				wireTree.forEach(wire => {
// 					if (traversedWires.has(wire.id)) {
// 						return;
// 					}
			
// 					if (isWireConnectedToWire(wire, currentWire)) {
// 						wires.push(wire);
// 						wire.from = currentWire.from;
// 						if(currentWire.id !== wire.id){
// 							wire.wirePath = [...currentWire.wirePath, wire.id];
// 						}
// 						//console.log(`connecting ${currentWire.id.slice(0, 5)} -> ${wire.id.slice(0, 5)}`);
// 						wire.connectedToId?.forEach((connection, idx) => {
// 							connections[connection.id] = wire.id;
// 						});
// 					}
// 				});
			
// 				traversedWires.add(currentWire.id);
// 			}
// 			toWire.wirePathConnectedTo?.forEach((connection, idx) => {
// 				if(connection.gateId){
// 					state.gates[connection.gateId].inputs[connection.id].from = fromWire.from;
// 					state.gates[connection.gateId].inputs[connection.id].wirePath = state.wires[connections[connection.id]]?.wirePath;
// 				}else{
// 					state.globalOutputs[connection.id].from = fromWire.from;
// 					state.globalOutputs[connection.id].wirePath = state.wires[connections[connection.id]].wirePath;
// 				}
// 				if(from?.gateId){
// 					state.gates[from?.gateId].outputs[from.id].to?.push(connection);
// 				}else if(from){
// 					state.globalInputs[from.id].to?.push(connection);
// 				}
// 			});
			
// 		},
// 		changeGateOutput: (state, action: PayloadAction<{gateId: string, newState: 0 | 1}>) => {
// 			const output = Object.entries(state.gates[action.payload.gateId].outputs);
// 			let outputId = output.map(([key, output])=> {
// 				return key;
// 			})
// 			state.gates[action.payload.gateId].outputs[outputId[0]].state = action.payload.newState;

// 		},
// 		updateState: (state, action: PayloadAction<{
// 			gates:{[key:string]:Gate}, 
// 			inputs:{[key:string]:BinaryInput}, 
// 			outputs: {[key:string]: BinaryOutput}}>) => {
// 				state.gates = action.payload.gates;
// 				state.globalInputs = action.payload.inputs;
// 				state.globalOutputs = action.payload.outputs;
// 		},
// 		createComponent: (state, action: PayloadAction) => {
// 			const newComponent = deepCopyComponent(state.gates, state.globalInputs, state.globalOutputs);
// 			const newId = uuidv4();
// 			let name = 'testName'
// 			Object.entries(state.createdComponents).forEach(([key, component]) => {
// 				if(component.name === 'testName'){
// 					name = 'name';
// 				}
// 			})
// 			const newGate = {
// 				name: name,
// 				id: newId,
// 				inputs: deepCopyInputs(newComponent.newInputs),
// 				outputs: deepCopyOutputs(newComponent.newOutputs),
// 				gates: deepCopyNestedGates(newComponent.newGates),
// 			}
// 			state.createdComponents[newId] = newGate;
// 			state.gates = {};
// 			state.wires = {};
// 			state.globalInputs = {};
// 			state.globalOutputs = {};
// 		}
// 	}
	
// });

// export default entities.reducer;
// export const {addWire, 
// 	changeWirePosition, 
// 	addGate, 
// 	addCurrentInput,
// 	changeGate, 
// 	removeGate,
// 	removeWire,
// 	changeInputState,
// 	changeInputPosition,
// 	addWireToGateInput,
// 	disconnectWireFromGate,
// 	addGlobalOutput,
// 	connectToGlobalOutput,
// 	disconnectWireFromGlobalOutput,
// 	breakWirePath,
// 	connectWireToWire,
// 	changeGateOutput,
// 	updateState,
// 	createComponent} = entities.actions;