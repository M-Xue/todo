import React from 'react';
import ToDoItem from './ToDoItem';
import { useQuery } from '@tanstack/react-query';
import { ResponseGetToDoByDate, ToDoItemWithRank } from '@/types/typeshare';
import { useDateStore } from '@/state/date';
import { sortToDoRanks } from '@/lib/utils';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableWrapper from '@/components/dnd-kit/DraggableWrapper';

export default function ToDoList() {
	const date = useDateStore((state) => state.date);

	const toDoQuery = useQuery({
		// You want to crop the ISO string so that the cache key will be the date only. If you use the raw ISO string, every time you reset the date to "Today", the hour/minutes/seconds/milliseconds will change, meaning the cache keys won't match.
		queryKey: ['todos-by-date', date.toISOString().substring(0, 10)],
		queryFn: async (): Promise<ResponseGetToDoByDate> => {
			return fetch(
				'http://localhost:8080/api/todo/date/' + date.toISOString()
			)
				.then((res) => res.json())
				.catch((err) => {
					throw Error(err);
				}); // TODO: check if this is how you catch an error: https://tanstack.com/query/v4/docs/react/guides/query-functions#usage-with-fetch-and-other-clients-that-do-not-throw-by-default
		},
		initialData: {
			// TODO: this is so the initial content on the screen is not is loading. Still need to find a way for cache to persist for longer
			items: [],
		},
	});

	// TODO: Fix these later
	if (toDoQuery.isLoading) return <h1>Loading...</h1>;
	if (toDoQuery.isError) return <pre>{JSON.stringify(toDoQuery.error)}</pre>;

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={toDoQuery.data.items}
				strategy={verticalListSortingStrategy}
			>
				<div className='select-none'>
					{sortToDoRanks([...toDoQuery.data.items]).map((item) => (
						<DraggableWrapper key={item.id} id={item.id}>
							{/* {item.rank} */}
							<ToDoItem todoItem={item} />
						</DraggableWrapper>
					))}
				</div>
			</SortableContext>
		</DndContext>
		// <div className='select-none'>
		// 	{sortToDoRanks([...toDoQuery.data.items]).map((item) => (
		// 		<div key={item.id}>
		// 			{item.rank}
		// 			<ToDoItem todoItem={item} />
		// 		</div>
		// 	))}
		// </div>
	);

	function handleDragEnd() {
		
	}
}

