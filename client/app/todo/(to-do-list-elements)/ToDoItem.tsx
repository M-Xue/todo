import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export default function ToDoItem() {
	return (
		<div className='p-2 mb-2 border-box-shadow'>
			{/* use shadow-raised utility class when dragging */}
			<Checkbox />
			<span>To Do Item Title</span>
		</div>
	);
}
