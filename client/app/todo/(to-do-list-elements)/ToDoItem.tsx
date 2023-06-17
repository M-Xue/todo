import React, { MouseEvent } from 'react';
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

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: id });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? '20' : undefined,
		position: isDragging ? 'relative' : undefined,
		boxShadow: isDragging ? 'rgba(0, 0, 0, 0.15) 0px 9px 17px' : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className='z-10 flex items-center p-2 mb-2 border-box-shadow'
			onClick={(e) => {
				console.log('click');
			}}
		>
			{/* use shadow-raised utility class when dragging */}
			<button
				// variant='ghost'
				type='button'
				{...attributes}
				{...listeners}
				className='px-[4px] py-[10px] rounded-sm transition opacity-25 hover:bg-accent hover:opacity-100 active:bg-accent active:opacity-100 '
			>
				<svg viewBox='0 0 20 20' width='12'>
					<path d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z'></path>
				</svg>
			</button>

			<Checkbox
				onCheckedChange={completedToDoMutation.mutate}
				checked={todoItem.complete}
				className='ml-2'
				onClick={(e: MouseEvent) => e.stopPropagation()}
			/>
			<span className='ml-2'>{todoItem.title}</span>
		</div>
	);
}
