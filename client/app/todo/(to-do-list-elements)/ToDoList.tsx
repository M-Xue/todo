import React from 'react';
import ToDoItem from './ToDoItem';
import { UUID } from 'crypto';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type ToDoItemType = {
	id: UUID;
	date: string;
	title: string;
	completed: boolean;

	// startTime?: Date
	// endTime?: Date
	// description: string;
	// parentToDo: UUID;
	// order: number; // For the order they should be rendered as a list
};
// Just do a useState mock up for now and implement react query and a backend later
// Complete the entire ToDoContainer
// Calendar and weekday goes in ToDoContainer
export default function ToDoList() {
	return (
		<div className='select-none'>
			<Button variant='outline' className='text-sm font-normal'>
				Add Task <Plus className='w-4 h-4 mr-2' />
			</Button>
			<ToDoItem />
		</div>
	);
}
