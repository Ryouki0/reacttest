import { Action, AnyAction, PayloadAction, createSlice, current } from "@reduxjs/toolkit";
import { Wire } from "../../Interfaces/Wire";
import { Gate } from "../../Interfaces/Gate";
import {v4 as uuidv4} from 'uuid';

import { BinaryIO } from "../../Interfaces/BinaryIO";
import { calculateInputTop } from "../../utils/calculateInputTop";
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from "../../Constants/defaultDimensions";
import { propagateIo } from "../../utils/propagateIo";
import { addRawReducers } from "../../utils/addRawReducers";
import calculateAbsoluteIOPos from "../../utils/calculateAbsoluteIOPos";


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
	bluePrints: {gates: {[key: string]:Gate}, io: {[key: string]: BinaryIO}, wires: {[key: string]: Wire}};
	binaryIO: {[key: string]:BinaryIO};
	currentComponent: {wires: {[key: string]: Wire}, gates: {[key: string]: Gate}, binaryIO: {[key: string]: BinaryIO}}
}

const initialState = {wires: {}, gates: {}, currentComponent: {gates: {}, wires: {}, binaryIO: {}},
	bluePrints: {gates: {
		[ANDId]: {
			name: 'AND',
			parent: 'global',
			complexity: 1,
			inputs: [ANDInputId1, ANDInputId2],
			outputs: [ANDOutputId1],
			id: ANDId
		},
		[NOId]: {
			name: 'NO',
			complexity: 1,
			parent: 'global',
			inputs: [NOInputId1],
			outputs: [NOOutputId1],
			id: NOId
		},
		[DELAYId]: {
			name: 'DELAY',
			complexity: 1,
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
			name: 'input 1',
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
			name: 'input 2',
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
			name: 'output 1',
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
			name: 'input 1',
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
			name: 'output 1',
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
			name: 'input 1',
			to: [],
			isGlobalIo: false,
			type: 'input',
			style: {},
		},
		[DELAYOutputId1]: {
			id: DELAYOutputId1,
			state: 0,
			gateId: DELAYId,
			name: 'output 1',
			to: [],
			parent: 'global',
			isGlobalIo: false,
			type: 'output',
			style: {},
		}
	}, 
	wires: {}
}, 
	binaryIO: {}
} as entities;



const entities = createSlice({
	name: 'entities',
	initialState: initialState,
	reducers: {
		addWire: (state, action: PayloadAction<Wire>) => {
			state.currentComponent.wires[action.payload.id] = action.payload;
		},
		changeWirePosition: (state,action:PayloadAction<Wire>) => {
			if(state.currentComponent.wires[action.payload.id]){
				state.currentComponent.wires[action.payload.id].diagonalLine = action.payload.diagonalLine;
				state.currentComponent.wires[action.payload.id].linearLine = action.payload.linearLine;
			}else{
				state.currentComponent.wires[action.payload.id] = {...action.payload};
			}
		},
		/**
		 * Adds a gate to the state.
		 * 
		 * Copy the blueprint into the state 1:1
		 * then change the IDs of every gate and IO in the actual state, while keeping the connections
		 */
		addGate: (state, action: PayloadAction<Gate>) => {
			/**
			 * Copies a gate into the state, top level only
			 * @param gate The gate to copy
			 */
			function copyGateIntoState(gate: Gate, isGlobal: boolean = false){
				if(isGlobal){
					state.currentComponent.gates[gate.id] = JSON.parse(JSON.stringify(gate));
					
					gate.inputs.forEach(inputId => {
						state.currentComponent.binaryIO[inputId] = JSON.parse(JSON.stringify(state.bluePrints.io[inputId]));
					});
					
					gate.outputs.forEach(outputId => {
						state.currentComponent.binaryIO[outputId] = JSON.parse(JSON.stringify(state.bluePrints.io[outputId]));
					});
					
					gate.wires?.forEach(wireId => {
						state.wires[wireId] = JSON.parse(JSON.stringify(state.bluePrints.wires[wireId]));
					})
				}else{
					state.gates[gate.id] = JSON.parse(JSON.stringify(gate));
					
					gate.inputs.forEach(inputId => {
						state.binaryIO[inputId] = JSON.parse(JSON.stringify(state.bluePrints.io[inputId]));
					});
					
					gate.outputs.forEach(outputId => {
						state.binaryIO[outputId] = JSON.parse(JSON.stringify(state.bluePrints.io[outputId]));
					});

					gate.wires?.forEach(wireId => {
						state.wires[wireId] = JSON.parse(JSON.stringify(state.bluePrints.wires[wireId]));
					})
				}
				
			}

			function copyBluePrintIntoState(gateId: string, isGlobalIo: boolean){
				const mainGate = state.bluePrints.gates[gateId];
				copyGateIntoState(mainGate, isGlobalIo);

				mainGate.gates?.forEach(gateId => {
					const gate = state.bluePrints.gates[gateId];
					
					if(gate.gates){
						copyBluePrintIntoState(gate.id, false);
					}else{
						copyGateIntoState(gate);
					}
				});
			}

			/**
			 * Replace the IDs of a gate, and it's IO's; and change the "to" and "from" of the connected IOs.
			 * @param gate The gate to replace
			 * @param parentId The parent's ID
			 */
			function replaceIdsInGate(gate:Gate, parentId: string){
				const newGateId = uuidv4();
				let newGate: Gate;
				if(parentId === 'global'){
					state.currentComponent.gates[newGateId] = {
						...gate, 
						id: newGateId, 
						inputs: [], 
						outputs: [],
						wires: [],
						position: {...gate.position!}
					};
					newGate = state.currentComponent.gates[newGateId];
				}else{
					state.gates[newGateId] = {
						...gate, 
						id: newGateId, 
						inputs: [], 
						outputs: [],
						wires: [], 
						position: {...gate.position!}
					};
					newGate = state.gates[newGateId];
				}


				/**
				 * Replace the gate ID in the parent gate, and add the parent gateId as the parent in this gate
				 * @param parentGates Either state.gates or state.currentComponent.gates, depending on where the parent gate is located
				 */
				function updateParent(parentGates: {[key: string]: Gate}){
					const prevGateIdx = parentGates[parentId].gates?.findIndex(gateId => gateId === gate.id);
					if(prevGateIdx === undefined || prevGateIdx === -1){
						throw new Error(`The parent gate doesn't contain the child gate ID: ${gate.id}`);
					}

					parentGates[parentId].gates![prevGateIdx] = newGateId;
					newGate.parent = parentId;
				}

				if(parentId !== 'global'){
					if(state.gates[parentId]){
						updateParent(state.gates);
					}else if(state.currentComponent.gates[parentId]){
						updateParent(state.currentComponent.gates);
					}else{
						throw new Error(`There is no gate at state.gates, state.currentComponent.gates at ID: ${parentId}`);
					}
				}
				/**
				 * Create the new inputs
				 */
				gate.inputs.forEach(inputId => {
					const newInputId = uuidv4();
					const prevInput = state.binaryIO[inputId] ?? state.currentComponent.binaryIO[inputId];
					
					if(!prevInput) {
						throw new Error(`No input at ID: ${inputId}`);
					}
				
					const newInput = {
						...prevInput,
						id: newInputId,
						position: {...prevInput.position!},
						gateId: newGateId,
						parent: parentId
					};
				
					if(parentId === 'global') {
						state.currentComponent.binaryIO[newInputId] = newInput;
					}else{
						state.binaryIO[newInputId] = newInput;
					}
				
					const from = state.binaryIO[prevInput.from?.id!] ?? state.currentComponent.binaryIO[prevInput.from?.id!];
					if(from){
						const idxOfThisInput = from.to?.findIndex(to => to.id === prevInput.id);
						if(idxOfThisInput !== undefined && idxOfThisInput !== -1) {
							from.to![idxOfThisInput] = { id: newInputId, gateId: newGateId, type: from.to![idxOfThisInput].type };
						}
					}
				
					prevInput.to?.forEach(to => {
						const toIo = state.binaryIO[to.id] ?? state.currentComponent.binaryIO[to.id];
						toIo.from = { id: newInputId, gateId: newGateId, type: toIo.from!.type };
					});
				
					newGate.inputs.push(newInputId);
					if (state.binaryIO[inputId]) {
						delete state.binaryIO[inputId];
					} else {
						delete state.currentComponent.binaryIO[inputId];
					}
				});

				/**
				 * Create the new outputs
				 */
				gate.outputs.forEach(outputId => {
					const newOutputId = uuidv4();
					const prevOutput = state.binaryIO[outputId] ?? state.currentComponent.binaryIO[outputId];
					if(!prevOutput){
						throw new Error(`There is no output at ${outputId}`);
					}

					prevOutput.to?.forEach(to => {
						const toIo = state.binaryIO[to.id] ?? state.currentComponent.binaryIO[to.id];
						if(!toIo){
							Object.entries(state.binaryIO).forEach(([key, io]) => {
								console.log(`whole state: ${key}`);
							});
							throw new Error(`No IO at ID: ${to.id}\nWhen prevOutput is: ${prevOutput.id} and gate is: ${gate.name} gateId: ${gate.id}`);
						}
						toIo.from = {id: newOutputId, gateId: newGateId, type: toIo.from?.type!};
					});
					const from = state.binaryIO[prevOutput.from?.id!] ?? state.currentComponent.binaryIO[prevOutput.from?.id!];
					if(from){
						const idxOfThisInput = from.to?.findIndex(to => to.id === prevOutput.id);
						if(idxOfThisInput !== undefined && idxOfThisInput !== -1){
							from.to![idxOfThisInput] = {id: newOutputId, gateId: newGateId, type: from.to![idxOfThisInput].type};
						}
					}
					newGate.outputs.push(newOutputId);
					const newOutput = {
						...prevOutput, 
						id: newOutputId,
						position: {...prevOutput.position!},
						gateId: newGateId, 
						parent: parentId
					};
					if(parentId === 'global'){
						state.currentComponent.binaryIO[newOutputId] = newOutput;
						delete state.currentComponent.binaryIO[outputId];
					}else{
						state.binaryIO[newOutputId] = newOutput;
						delete state.binaryIO[outputId];
					}
				});
				
				gate.wires?.forEach(wireId => {
					const newWireId = uuidv4();
					const prevWire = state.wires[wireId];
					const newWire = {
						...prevWire,
						id: newWireId,
						from: null,
						to: null,
						parent: newGateId
					}

					newGate.wires!.push(newWireId);
					state.wires[newWireId] = newWire;
					console.log(`Changed parent of ${newGateId.slice(0,6)} to ${parentId.slice(0,6)}`);
					delete state.wires[wireId];
				})

				if(parentId === 'global'){
					delete state.currentComponent.gates[gate.id];
				}else{
					delete state.gates[gate.id];
				}
				return newGateId;
			}

			/**
			 * Replaces the IDs in a component any layer deep
			 * @param gateId The main gate ID
			 * @param parent The parent if it has, else 'global'
			 */
			function replaceGatesRecursively(gateId: string, parent: string){
				let mainGate: Gate;
				if(parent === 'global'){
					mainGate = state.currentComponent.gates[gateId];
				}else{
					mainGate = state.gates[gateId];
				}
				const newMainGateId = replaceIdsInGate(mainGate, parent);
				mainGate.gates?.forEach(gateId => {
					const currentGate = state.gates[gateId];
					if(!currentGate){
						mainGate.gates?.forEach(gateId => {
							console.log(`Gate IDS: ${gateId}`);
						});
						throw new Error(`No gate in the state at ID: ${gateId} \n parent: ${parent} mainGate: ${mainGate.name}`);
					}
					if(currentGate.gates){
						replaceGatesRecursively(currentGate.id, newMainGateId);
					}else{
						replaceIdsInGate(currentGate, newMainGateId);
					}
				});
			}

			copyBluePrintIntoState(action.payload.id, true);
			
			replaceGatesRecursively(action.payload.id, 'global');
			
		},
		
		changeGatePosition: (state, action: PayloadAction<{gate:Gate,position: {x:number,y:number}}>) => {
			
			const gate = state.currentComponent.gates[action.payload.gate.id];
			gate.position = action.payload.position;
			const newInputPositions: {[key: string]: {x: number, y: number}} = {};
			gate.inputs.forEach((inputId, idx, array) => {
				newInputPositions[inputId] = calculateAbsoluteIOPos(gate, state.currentComponent.binaryIO[inputId]);
			});

			gate.outputs.forEach((outputId, idx, array) => {
				newInputPositions[outputId] = calculateAbsoluteIOPos(gate, state.currentComponent.binaryIO[outputId]);
			});

			Object.entries(newInputPositions).forEach(([key, position]) => {
				const currentIo = state.currentComponent.binaryIO[key];
				currentIo.position =  position;
			});
		},
		addInput: (state, action:PayloadAction<BinaryIO>) => {
			const inputs = Object.entries(state.currentComponent.binaryIO);
			for(const [key, input] of inputs){
				if(input.type === 'input' && !input.gateId){
					if(input.position?.y === action.payload.position?.y){
						return;
					}
				}
			}
			state.currentComponent.binaryIO[action.payload.id] = action.payload;

		},
		changeInputState: (state, action:PayloadAction<string>) => {
			const newState = state.currentComponent.binaryIO[action.payload].state ? 0 : 1;
			state.currentComponent.binaryIO[action.payload].state = newState;
			propagateIo(action.payload, state.binaryIO, state.currentComponent.binaryIO);
			
			
		},
		addGlobalOutput: (state, action: PayloadAction<BinaryIO>) => {
			const ioEntries = Object.entries(state.currentComponent.binaryIO);
			for(const [key, io] of ioEntries){
				if(io.type === 'output' && !io.gateId){
					if(io.position?.y === action.payload.position?.y){
						return;
					}
				}
			}
			state.currentComponent.binaryIO[action.payload.id] = action.payload;
		},
		changeIOPosition: (state, action:PayloadAction<{id: string, position: {x:number, y:number}}>) => {
			state.currentComponent.binaryIO[action.payload.id].position = action.payload.position;
		},
		setConnections: (state, action:PayloadAction<{
			connections: {wireTree: string[], outputs: string[], sourceId: string|null}[], 
			componentId?: string}>) => {
			const connections = action.payload.connections;
			const ioEntires = Object.entries(state.currentComponent.binaryIO);
			const wireEntries = Object.entries(state.currentComponent.wires);
			const currentComponentId = action.payload.componentId ?? 'global';
			

			for(const [key, io] of ioEntires){
				if((io.type === 'output' && !io.isGlobalIo) 
					|| (io.type === 'input' && io.isGlobalIo && !io.gateId) 
					|| (io.type === 'output' && io.isGlobalIo && io.gateId && io.gateId !== currentComponentId)){
					io.to = [];
				}else if((io.type === 'input' && !io.isGlobalIo) 
					|| (io.type === 'output' && io.isGlobalIo && !io.gateId) 
					|| (io.type === 'input' && io.isGlobalIo && io.gateId && io.gateId !== currentComponentId)){
					io.from = null;
					io.state = 0;
					if(io.to!.length > 0){
						propagateIo(io.id, state.binaryIO, state.currentComponent.binaryIO);
					}
				}
			}

			connections.forEach(connection => {
				const source = state.currentComponent.binaryIO[connection.sourceId!];
				if(source){
					source.to = [];
				}

				connection.wireTree.forEach(wireId => {
					state.currentComponent.wires[wireId].error = false;
					state.currentComponent.wires[wireId].from = source ? {id: source.id, gateId: source.gateId, type: source.type} : null;
				});
				connection.outputs.forEach(outputId => {
					const output = state.currentComponent.binaryIO[outputId];
					output.from = source ? {id: source.id, gateId: source.gateId, type: source.type} : null;
					output.state = source?.state ?? 0;
					propagateIo(output.id, state.binaryIO, state.currentComponent.binaryIO);
					if(source){
						let contains = false;
						source.to?.forEach(to => {
							if(to.id === output.id){	
								contains = true;
							}
						});
						if(contains){
							return;
						}
						source.to?.push({id: output.id, gateId: output.gateId, type: output.type});
					}
				});
				
			});
		},
		deleteWire: (state, action:PayloadAction<string>) => {
			delete state.currentComponent.wires[action.payload];
		},
		deleteComponent: (state, aciton: PayloadAction<string>) => {
			const component = state.currentComponent.gates[aciton.payload];
			function deleteBaseGate(gateId: string){
				const gate = state.gates[gateId] ?? state.currentComponent.gates[gateId];
				gate.inputs.forEach(inputId => {
					if(state.binaryIO[inputId]){
						delete state.binaryIO[inputId];
					}else{
						delete state.currentComponent.binaryIO[inputId];
					}
				});
				gate.outputs.forEach(outputId => {
					if(state.binaryIO[outputId]){
						delete state.binaryIO[outputId];
					}else{
						delete state.currentComponent.binaryIO[outputId];
					}
				});
				if(state.gates[gateId]){
					delete state.gates[gateId];
				}else{
					delete state.currentComponent.gates[gateId];
				}
			}
			if(!component.gates){
				deleteBaseGate(component.id);
			}else{
				const nextGateIds: string[] = [...component.gates];
				deleteBaseGate(component.id);
				while(nextGateIds.length > 0){
					const currentGate = state.gates[nextGateIds.pop()!];
					if(!currentGate) continue;
					if(currentGate.gates){
						nextGateIds.push(...currentGate.gates);
					}
					deleteBaseGate(currentGate.id);
				}
			}
		},
		updateState: (state, action: PayloadAction<{gates: {[key: string]: Gate}, binaryIO: {[key: string] :BinaryIO}}>) => {
			const gates = action.payload.gates;
			const binaryIO = action.payload.binaryIO;
			Object.entries(state.currentComponent.gates).forEach(([key, gate]) => {
				if(!gates[key]){
					throw new Error(`In the combined new state there is no gate at ID: ${key}\nLength of 'gates' from the worker: ${Object.entries(gates).length}`);
				}
				state.currentComponent.gates[key] = gates[key];
				delete gates[key];
			});

			Object.entries(state.currentComponent.binaryIO).forEach(([key, io]) => {
				if(!binaryIO[key]){
					throw new Error(`In the combined new state there is no IO at ID: ${key}`);
				}

				state.currentComponent.binaryIO[key] = binaryIO[key];
				delete binaryIO[key];
			});
			state.binaryIO = binaryIO;
			state.gates = gates;
		},
		
		createBluePrint: (state, action: PayloadAction<{name: string}>) => {
			const allGates: {[key: string]: Gate} = {};
			let complexity = 0;

			Object.entries(state.currentComponent.gates).forEach(([key, gate]) => {
				complexity += gate.complexity;
				allGates[key] = gate;
			});
			Object.entries(state.gates).forEach(([key, gate]) => {
				allGates[key] = gate;
			});

			const gateEntries = Object.entries(allGates);
			const allIo: {[key: string]: BinaryIO} = {};
			Object.entries(state.binaryIO).forEach(([key, io]) => {
				allIo[key] = io;
			});
			Object.entries(state.currentComponent.binaryIO).forEach(([key, io]) => {
				allIo[key] = io;
			});

			const ioEntries = Object.entries(allIo);
			const topLevelGates = gateEntries.reduce((acc:{[key: string]: Gate}, [key, gate]: [string, Gate]) => {
				if(gate.parent === 'global'){
					acc[key] = gate;
				}
				return acc;
			}, {});
			const globalInputs = ioEntries.map(([key, io]) => {if(io.isGlobalIo && !io.gateId && io.type === 'input'){
				return io;
			}}).filter((io) => io !== undefined) as Exclude<typeof ioEntries[0][1], undefined>[];

			const globalOutputs = ioEntries.map(([key, io]) => io.isGlobalIo && !io.gateId && io.type === 'output' ? io : undefined)
				.filter(io => io !== undefined) as Exclude<typeof ioEntries[0][1], undefined>[];

			globalInputs.sort((a, b) => a.position!.y - b.position!.y);
			globalOutputs.sort((a,b) => a.position!.y - b.position!.y);
			
			const newGateId = uuidv4();
			const newGate:Gate = {
				gates: Object.entries(topLevelGates).map(([key, gate]) => key),
				name: action.payload.name,
				id: newGateId,
				complexity: complexity,
				wires: Object.keys(state.currentComponent.wires),
				parent: 'global',
				inputs: globalInputs.map(input => input.id),
				outputs: globalOutputs.map(output => output.id)
			};
			state.bluePrints.gates[newGateId] = newGate;
		
			const wireEntries = Object.entries(state.currentComponent.wires);
			const subWireEntries = Object.entries(state.wires);
			wireEntries.forEach(([key, wire]) => {
				state.bluePrints.wires[key] = wire;
			});

			subWireEntries.forEach(([key, wire]) => {
				state.bluePrints.wires[key] = wire;
			})
			
			gateEntries.forEach(([key, gate]) => {
				state.bluePrints.gates[key] = {...gate, parent: newGateId};
			});
			ioEntries.forEach(([key, io]) => {
				state.bluePrints.io[key] = {...io, parent: newGateId};
			});

			globalOutputs.forEach(output => {
				state.bluePrints.io[output.id].gateId = newGateId;
			});
			globalInputs.forEach(input => {
				state.bluePrints.io[input.id].gateId = newGateId;
			});

			state.currentComponent = {gates: {}, wires: {}, binaryIO: {}};
			state.gates = {};
			state.wires = {};
			state.binaryIO = {};
		},
		raiseShortCircuitError: (state, action: PayloadAction<{wireTree: string[]}>) => {
			
			action.payload.wireTree.forEach(wireId => {
				state.currentComponent.wires[wireId].error = true;
			});
		},
		changeBluePrintPosition: (state, action:PayloadAction<{gateId: string, position: {x: number, y: number}}>) => {
			const gateId = action.payload.gateId;
			const topLevelGate = state.bluePrints.gates[gateId];
			const newPosition = action.payload.position;
			topLevelGate.position = action.payload.position;

			topLevelGate.inputs.forEach((inputId, idx, array) => {
				state.bluePrints.io[inputId].position = {
					x: newPosition.x,
					y: newPosition.y + calculateInputTop(idx, array.length) + DEFAULT_INPUT_DIM.height/2 + idx*DEFAULT_INPUT_DIM.height
				};
			});

			topLevelGate.outputs.forEach((outputId, idx, array) => {
				state.bluePrints.io[outputId].position = {
					x: newPosition.x + 3*MINIMAL_BLOCKSIZE,
					y: newPosition.y + calculateInputTop(idx, array.length) + 
					(idx*DEFAULT_INPUT_DIM.height) + DEFAULT_INPUT_DIM.height/2
				};
			});
		},
		setGateDescription: (state, action: PayloadAction<{gateId: string, description: string}>) => {
			const gate = state.currentComponent.gates[action.payload.gateId];
			if(!gate){
				throw new Error(`There is no gate in the current component at ID: ${action.payload.gateId}`);
			}

			gate.description = action.payload.description;
		},
		switchCurrentComponent: (state, action: PayloadAction<{componentId: string, prevComponent: string | null}>) => {
			const componentId = action.payload.componentId;
			const component = state.currentComponent.gates[componentId] ?? state.gates[componentId];

			const currentGateEntries = Object.entries(state.currentComponent.gates);
			const currentIoEntries = Object.entries(state.currentComponent.binaryIO);
			const currentWireEntries = Object.entries(state.currentComponent.wires);

			const subGateEntries = Object.entries(state.gates);
			
			state.currentComponent = {gates:{}, binaryIO: {}, wires: {}};
			
			//Put everything from the current component, to the combined state
			currentGateEntries.forEach(([key, gate]) => {
				state.gates[key] = gate;
				delete state.currentComponent.gates[key];
			})

			currentIoEntries.forEach(([key, io]) => {
				state.binaryIO[key] = io;
				delete state.currentComponent.binaryIO[key];
			});
			
			currentWireEntries.forEach(([key, wire]) => {
				state.wires[key] = wire;
				delete state.currentComponent.wires[key];
			})

			const newCurrentComponentGates = subGateEntries.map(([key, gate]) => {
				if(gate.parent === componentId){
					return gate;
				}
			}).filter((gate): gate is Gate => gate !== undefined);

			const newCurrentComponentIo = Object.entries(state.binaryIO).map(([key, io]) => {
    			if(io.parent === componentId) {
      				return io;
    			}
    			return undefined;
  			}).filter((io): io is BinaryIO => io !== undefined);
			
			const newCurrentComponentWires:Wire[] = Object.entries(state.wires).map(([key,wire]) => {
				if(wire.parent === componentId){
					return wire;
				}
				return undefined;
			}).filter((wire): wire is Wire => wire !== undefined);

			function changeGlobalInputPosition(input:BinaryIO){
				const newInput:BinaryIO = {
					...input,
					position: {
						x: 2*MINIMAL_BLOCKSIZE,
						y: (input.style?.top as number) + DEFAULT_INPUT_DIM.height/2,
					}
				}
				return newInput;
			}

			function changeGlobalOutputPosition(output: BinaryIO){
				const newOutput = {
					...output,
					position: {
						x: CANVAS_WIDTH - MINIMAL_BLOCKSIZE,
						y: (output.style?.top as number) + DEFAULT_INPUT_DIM.height - DEFAULT_BORDER_WIDTH
					}
				}
				return newOutput;
			}

			if(componentId === 'global'){
				Object.entries(state.binaryIO).forEach(([key, io], idx) => {
					if(!io.gateId && io.type === 'input'){
						const newInput = changeGlobalInputPosition(io);
						newCurrentComponentIo.push(newInput);
					}else if(!io.gateId && io.type === 'output'){
						const newOutput = changeGlobalOutputPosition(io);
						newCurrentComponentIo.push(newOutput);
					}
				})
				
			}else{
				component.inputs.forEach(inputId => {
					const prevInput = state.binaryIO[inputId];
					const newInput = changeGlobalInputPosition(prevInput);
					newCurrentComponentIo.push(newInput);
				});
				component.outputs.forEach(outputId => {
					const prevOutput = state.binaryIO[outputId];
					const newOutput = changeGlobalOutputPosition(prevOutput);
					newCurrentComponentIo.push(newOutput);
				});
			}
			
			newCurrentComponentIo.forEach(io => {
				if(action.payload.prevComponent && io.gateId === action.payload.prevComponent){
					const prevGate = state.currentComponent.gates[io.gateId] ?? state.gates[io.gateId];
					if(!prevGate){
						throw new Error(`There is no gate in the state at ID: ${io.gateId}`);
					}	
					const newPos = calculateAbsoluteIOPos(prevGate, io);
					io.position = newPos;
				}
 				state.currentComponent.binaryIO[io.id] = io;
				console.log(`IO: ${io.id.slice(0,6)} -- ${io.gateId?.slice(0,6)}`);
				delete state.binaryIO[io.id];
			});
				
			newCurrentComponentGates.forEach(gate => {
				state.currentComponent.gates[gate.id] = gate;
				delete state.gates[gate.id];
			})
			
			newCurrentComponentWires?.forEach(wire => {
				state.currentComponent.wires[wire.id] = wire;
				delete state.wires[wire.id];
			})
		}
	}
});


export const {updateStateRaw} = addRawReducers(entities, {
	updateStateRaw: (state: entities, action: AnyAction): entities => {
	  const { gates, binaryIO } = action.payload;
  
	  const newGates = { ...state.currentComponent.gates };
	  Object.entries(state.currentComponent.gates).forEach(([key, gate]) => {
		if (!gates[key]) {
		  throw new Error(`In the combined new state there is no gate at ID: ${key}\nLength of 'gates' from the worker: ${Object.entries(gates).length}`);
		}
		newGates[key] = gates[key];
		delete gates[key];
	  });
  
	  const newBinaryIO = { ...state.currentComponent.binaryIO };
	  Object.entries(state.currentComponent.binaryIO).forEach(([key, io]) => {
		if (!binaryIO[key]) {
		  throw new Error(`In the combined new state there is no IO at ID: ${key}`);
		}
		newBinaryIO[key] = binaryIO[key];
		delete binaryIO[key];
	  });
  
	  return {
		...state,
		currentComponent: {
		  gates: newGates,
		  wires: state.currentComponent.wires,
		  binaryIO: newBinaryIO,
		},
		gates,
		binaryIO,
	  };
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
	createBluePrint,
	raiseShortCircuitError,
	changeBluePrintPosition,
	setGateDescription,
	switchCurrentComponent,
} = entities.actions;