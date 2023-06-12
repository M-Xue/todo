import React, { useState } from 'react';
import ToDoItem from './ToDoItem';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	RequestUpdateToDoItemRank,
	ResponseGetToDoByDate,
	ToDoItemWithRank,
} from '@/types/typeshare';
import { useDateStore } from '@/state/date';
import { sortToDoRanks } from '@/lib/utils';
import {
	DndContext,
	DragEndEvent,
	UniqueIdentifier,
	closestCenter,
} from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import DraggableWrapper from '@/components/dnd-kit/DraggableWrapper';
import { LexoRank } from 'lexorank';
import { UUID } from 'crypto';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

const sortRanks = (a: ToDoItemWithRank, b: ToDoItemWithRank) => {
	if (a.rank < b.rank) {
		return -1;
	}
	if (a.rank > b.rank) {
		return 1;
	}
	return 0;
};

export default function ToDoList() {
	const date = useDateStore((state) => state.date);
	const [list, setList] = useState<ToDoItemWithRank[]>([]);

	const toDoQuery = useQuery({
		// You want to crop the ISO string so that the cache key will be the date only. If you use the raw ISO string, every time you reset the date to "Today", the hour/minutes/seconds/milliseconds will change, meaning the cache keys won't match.
		queryKey: ['todos-by-date', date.toISOString().substring(0, 10)],
		queryFn: async (): Promise<ResponseGetToDoByDate> => {
			const data: ResponseGetToDoByDate = await fetch(
				'http://localhost:8080/api/todo/date/' + date.toISOString()
			)
				.then((res) => res.json())
				.catch((err) => {
					throw Error(err);
				}); // TODO: check if this is how you catch an error: https://tanstack.com/query/v4/docs/react/guides/query-functions#usage-with-fetch-and-other-clients-that-do-not-throw-by-default

			const newList = data.items.sort(sortRanks);
			setList(newList);
			return data;
		},
		initialData: {
			// TODO: this is so the initial content on the screen is not is loading. Still need to find a way for cache to persist for longer
			items: [],
		},
	});

	const queryClient = useQueryClient();

	const newRankMutation = useMutation({
		mutationFn: async (data: RequestUpdateToDoItemRank) => {
			return fetch('http://localhost:8080/api/todo/re_rank_item', {
				method: 'PUT',
				body: JSON.stringify({
					// TODO: Make this body typed? maybe give it a type in the input form
					iso_string: data.iso_string,
					item_id: data.item_id,
					new_rank: data.new_rank,
				}),
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
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

	// TODO: Fix these later
	if (toDoQuery.isLoading) return <h1>Loading...</h1>;
	if (toDoQuery.isError) return <pre>{JSON.stringify(toDoQuery.error)}</pre>;

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			modifiers={[restrictToVerticalAxis]}
		>
			<SortableContext
				items={list}
				strategy={verticalListSortingStrategy}
			>
				<div className='select-none'>
					{sortToDoRanks([...list]).map((item) => (
						<ToDoItem
							todoItem={item}
							key={item.id.toString() as UniqueIdentifier}
							id={item.id.toString() as UniqueIdentifier}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || !active || active.id === over.id) return;

		// * LexoRank algorithm
		const idArray = list.map((item) => item.id.toString());
		const activeIndex = idArray.indexOf(active.id.toString());
		const overIndex = idArray.indexOf(over.id.toString());
		const listCopy = [...list];

		if (activeIndex > overIndex) {
			if (overIndex === 0) {
				// genPrev
				listCopy[activeIndex].rank = LexoRank.parse(
					listCopy[overIndex].rank
				)
					.genPrev()
					.toString();
			} else {
				// genBetween with over and prev
				listCopy[activeIndex].rank = LexoRank.parse(
					listCopy[overIndex].rank
				)
					.between(LexoRank.parse(listCopy[overIndex - 1].rank))
					.toString();
			}
		} else if (activeIndex < overIndex) {
			if (overIndex === listCopy.length - 1) {
				// genNext
				listCopy[activeIndex].rank = LexoRank.parse(
					listCopy[overIndex].rank
				)
					.genNext()
					.toString();
			} else {
				// genBetween with over and next
				listCopy[activeIndex].rank = LexoRank.parse(
					listCopy[overIndex].rank
				)
					.between(LexoRank.parse(listCopy[overIndex + 1].rank))
					.toString();
			}
		}

		const newRank = listCopy[activeIndex].rank;

		const newList = listCopy.sort(sortRanks);

		console.log(newList);
		setList(newList);

		newRankMutation.mutate({
			iso_string: date.toISOString(),
			item_id: active.id as UUID,
			new_rank: newRank,
		});
	}
}
