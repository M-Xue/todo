'use client';
import React from 'react';
import ToDoList from './(to-do-list-elements)/ToDoList';
import DateControls from './(date-elements)/DateControls';
import DateHeading from './(date-elements)/DateHeading';

export default function ToDoContainer() {
	return (
		// og px-9
		<div className='h-full py-6 px-9 mx-96 border-x-4'>
			<div className='flex justify-between'>
				<DateHeading />
				<DateControls />
			</div>
			<div>
				<ToDoList />
			</div>
		</div>
	);
}
