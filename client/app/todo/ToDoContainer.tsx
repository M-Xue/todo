'use client';
import React from 'react';
import { useDateStore } from '@/state/date';
import { format } from 'date-fns';
import ToDoList from './ToDoList';
import DateControls from './DateControls';

function DateHeading() {
	const date = useDateStore((state) => state.date);
	return (
		<div>
			<div>{format(date, 'd LLLL y')}</div>
			<div>{format(date, 'EEEE')}</div>
		</div>
	);
}

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
