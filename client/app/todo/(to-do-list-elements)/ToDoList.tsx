import React from 'react';
import ToDoItem from './ToDoItem';
import { useQuery } from '@tanstack/react-query';
import { ResponseGetToDoByDate, ToDoItemWithRank } from '@/types/typeshare';
import { useDateStore } from '@/state/date';

export default function ToDoList() {
	const date = useDateStore((state) => state.date);

	const toDoQuery = useQuery({
		// You want to crop the ISO string so that the cache key will be the date only. If you use the raw ISO string, every time you reset the date to "Today", the hour/minutes/seconds/milliseconds will change.
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

	function sortToDoRanks(list:ToDoItemWithRank[]) {
		return list.sort((a, b) => {
			if (a.rank < b.rank) {
				return -1;
			}
			if (a.rank > b.rank) {
				return 1;
			}
			return 0;
		});
	}

	return (
		<div className='select-none'>
			{/* {toDoQuery.data.items.map((item) => (
				<div key={item.id}>
					{item.rank}
					<ToDoItem todoItem={item} />
				</div>
			))} */}
			{sortToDoRanks([...toDoQuery.data.items]).map((item) => (
				<div key={item.id}>
					{item.rank}
					<ToDoItem todoItem={item} />
				</div>
			))}
		</div>
	);
}

// Check how long the cache stays fresh cuz some of the caches are invalidated and the loading signal is shown again
// * Things skipped in react query:
// Network mode
// Window focus refetching
// Optimistic updates: https://tanstack.com/query/v4/docs/react/guides/optimistic-updates

// type ToDoItemType = {
// 	id: UUID;
// 	date: string;
// 	title: string;
// 	completed: boolean;

// 	// startTime?: Date
// 	// endTime?: Date
// 	// description: string;
// 	// parentToDo: UUID;
// 	// order: number; // For the order they should be rendered as a list
// };
