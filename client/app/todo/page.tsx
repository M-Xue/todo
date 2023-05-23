import React from 'react';
import ToDoContainer from './ToDoContainer';
import DayView from './DayView';

export default function Page() {
	return (
		<div className='h-screen pr-80'>
			<ToDoContainer />

			{/* <div>
				<DayView />
			</div> */}
		</div>
	);
}
