import React, { useEffect, useMemo, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { setActuals, setError, setIsRunning } from '../state/slices/clock';
import { updateNonAffectingInputs, updateState, updateStateRaw } from '../state/slices/entities';
import { WorkerEvent } from '../logic.worker';


export default function useRunLogic(){
	const hertz = useSelector((state: RootState) => {return state.clock.hertz;});
	const refreshRate = useSelector((state: RootState) => {return state.clock.refreshRate;});
	const isRunning = useSelector((state: RootState) => {return state.clock.isRunning;});
	const currentComponent = useSelector((state: RootState) => {return state.entities.currentComponent;}, shallowEqual);
	const io = useSelector((state: RootState) => {return state.entities.binaryIO;});
	const gates = useSelector((state: RootState) => {return state.entities.gates;});
    
	const workerRef = useRef<Worker | null>(null);
	const importedWorkerRef = useRef();
    
	const intervalRef = useRef<NodeJS.Timer | null>();
	const startTime = useRef<number>(Date.now());
	const actualHertz = useRef<number>(0);
	const actualRefreshRate = useRef<number>(0);
	const timeTookStart = useRef(0);
	const timeTook = useRef(0);
    
	const shouldUpdateWorker = useRef(true);
	const calls = useRef(0);
	const newWorkerData = useRef<WorkerEvent | null>(null);
	const dispatch = useDispatch();

	useEffect(() => {
		const logicWorker = require('../logic.worker.ts').default;
		importedWorkerRef.current = logicWorker;
	}, []);

	useEffect(() => {
		calls.current++;
		if (isRunning && !workerRef.current) {
			//@ts-ignore
			workerRef.current = new importedWorkerRef.current();

            workerRef.current!.onmessage = (event: MessageEvent<WorkerEvent>) => {
            	function update(){
            		newWorkerData.current = event.data;
            		shouldUpdateWorker.current = false;
            		timeTook.current = Date.now() - timeTookStart.current;
                    
            		const newData = newWorkerData.current;
            		dispatch(updateStateRaw({gates: newData!.gates, binaryIO: newData!.binaryIO}));
            		actualRefreshRate.current++;
            		actualHertz.current += newData!.actualHertz;
                    
            		if(Date.now() - startTime.current >= 1000){
            			dispatch(setActuals({actualHertz: actualHertz.current, actualRefreshRate: actualRefreshRate.current}));
            			startTime.current = Date.now();
            			actualHertz.current = 0;
            			calls.current = 0;
            			actualRefreshRate.current = 0;
            		}
            	}
            	if(event.data.error){
            		dispatch(setError({isError: true, extraInfo: event.data.error}));
            		dispatch(setIsRunning(false));
            	}else if(event.data.nonAffectingInputs){
            		event.data.nonAffectingInputs.forEach(id => {
            			console.log(`${io[id]?.name ?? currentComponent.binaryIO[id]?.name} -- ${id}`);
            		});
            		const nonAffectingInputsSet = new Set(event.data.nonAffectingInputs);
            		shouldUpdateWorker.current = false;
            		console.log(`calling update`);
            		dispatch(updateNonAffectingInputs(nonAffectingInputsSet));
            	}
            	else{
            		update();
            	}
            };
            timeTookStart.current = Date.now();
            const message = JSON.stringify({
            	currentComponent: currentComponent,
            	gates: gates,
            	io: io,
            	refreshRate: refreshRate,
            	hertz: hertz,
            	startTime: timeTookStart.current
            });
            workerRef.current?.postMessage(message);
           
		}
		return () => {
			if(workerRef.current && shouldUpdateWorker.current) {
				workerRef.current.terminate();
				workerRef.current = null;
				if(intervalRef.current){
					clearInterval(intervalRef.current);
				}
			}else if(!shouldUpdateWorker.current){
				shouldUpdateWorker.current = true;
			}
		};
	}, [isRunning, refreshRate, hertz, currentComponent]);
}