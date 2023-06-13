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
		<div className='flex flex-col h-full py-6 '>
			<div className='flex justify-between px-9'>
				<DateHeading />
				<DateControls />
			</div>
			<div className='mb-3 px-9'>
				<AddItemDialog />
			</div>

			<div className='flex flex-col pt-3 pb-6 overflow-y-scroll px-9 grow scrollbar-hide'>
				{/* overflow-y-scroll scrollbar-hide */}
				<div className='grow'>
					<ToDoList />
				</div>
			</div>
		</div>
	);
}
