import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ToDoItem as ToDoItemType } from '@/types/typeshare';

export default function ToDoItem({ todoItem }: { todoItem: ToDoItemType }) {
	// Debounce checkbox POST request
	return (
		<div className='flex items-center p-2 mb-2 border-box-shadow'>
			{/* use shadow-raised utility class when dragging */}
			<Checkbox />
			<span className='ml-4'>{todoItem.title}</span>
		</div>
	);
}
