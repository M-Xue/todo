import React, { SyntheticEvent } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ToDoItem as ToDoItemType } from '@/types/typeshare';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDateStore } from '@/state/date';

export default function ToDoItem({ todoItem }: { todoItem: ToDoItemType }) {
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
	return (
		<div className='flex items-center p-2 mb-2 border-box-shadow'>
			{/* use shadow-raised utility class when dragging */}
			<Checkbox
				onCheckedChange={completedToDoMutation.mutate}
				checked={todoItem.complete}
			/>
			<span className='ml-4'>
				{todoItem.title}
				{todoItem.id}
			</span>
		</div>
	);
}
