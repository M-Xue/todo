import React, { SyntheticEvent } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ToDoItem as ToDoItemType, ToDoItemWithRank } from '@/types/typeshare';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDateStore } from '@/state/date';

import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function ToDoItem({
	todoItem,
	id,
}: {
	todoItem: ToDoItemWithRank;
	id: UniqueIdentifier;
}) {
	// Debounce checkbox POST request
	const date = useDateStore((state) => state.date);

	const queryClient = useQueryClient();
	const completedToDoMutation = useMutation({
		mutationFn: async (completed: boolean) => {
			return fetch(
				'http://localhost:8080/api/todo/item_completed/' + todoItem.id,
				{
					method: 'PATCH',
					body: JSON.stringify({
						// TODO: Make this body typed? maybe give it a type in the input form
						completed: completed,
					}),
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
				}
			);
		},
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: [
					'todos-by-date',
					date.toISOString().substring(0, 10),
				],
				exact: true,
			}),
	});

	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: id });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} className='flex items-center mb-2'>
			{/* use shadow-raised utility class when dragging */}

			<Checkbox
				onCheckedChange={completedToDoMutation.mutate}
				checked={todoItem.complete}
				className='absolute z-10 ml-3'
			/>
			<button
				{...attributes}
				{...listeners}
				className='flex items-center w-full p-2 border-box-shadow'
			>
				<span className='ml-7'>
					{todoItem.title} {todoItem.rank}
				</span>
			</button>
		</div>
	);
}
