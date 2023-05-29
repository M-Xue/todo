'use client';
import React from 'react';
import ToDoList from './(to-do-list-elements)/ToDoList';
import DateControls from './(date-elements)/DateControls';
import DateHeading from './(date-elements)/DateHeading';
import { AddItemDialog } from './(add-todo-dialog)/AddItemDialog';
import { InputReactHookForm } from './(add-todo-dialog)/TestForm';

// Calendar and weekday goes in ToDoContainer
export default function ToDoContainer() {
	return (
		<div className='h-full py-6 px-9'>
			<div className='flex justify-between'>
				<DateHeading />
				<DateControls />
			</div>
			<div className='mt-6'>
				<AddItemDialog />
				<div className='mt-4'>
					<ToDoList />
				</div>
			</div>
		</div>
	);
}
