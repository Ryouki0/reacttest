import React from 'react';
import Clock from './Clock';
import CreateButton from './CreateButton';
import SelectedComponent from './SelectedComponent';
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH } from '../../Constants/defaultDimensions';
import DisplayError from './DisplayError';
import BackToMenu from './BackToMenu';

export default function Toolbar() {
	return <div style={{
		position: 'absolute',
		left: CANVAS_WIDTH,
		width: window.innerWidth - CANVAS_WIDTH,
		height: '100%',
		borderWidth: DEFAULT_BORDER_WIDTH,
		borderStyle: 'solid',
		borderLeft: 0,
		borderColor: 'rgb(60 60 60)',
		backgroundColor: 'rgb(100 100 100)',
	}}>
		<SelectedComponent></SelectedComponent>
		<DisplayError></DisplayError>
		<Clock></Clock>
		<CreateButton></CreateButton>
		<BackToMenu></BackToMenu>
	</div>;
}