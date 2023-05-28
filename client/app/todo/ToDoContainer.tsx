'use client';
import React, { SyntheticEvent } from 'react';
import ToDoList from './(to-do-list-elements)/ToDoList';
import DateControls from './(date-elements)/DateControls';
import DateHeading from './(date-elements)/DateHeading';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDateStore } from '@/state/date';

// Calendar and weekday goes in ToDoContainer
export default function ToDoContainer() {
	const date = useDateStore((state) => state.date);

	const queryClient = useQueryClient();
	const newToDoMutation = useMutation({
		mutationFn: async (event: SyntheticEvent) => {
			event.preventDefault();
			console.log(date.toISOString());
			return fetch('http://localhost:8080/api/todo/item', {
				method: 'POST',
				body: JSON.stringify({
					// TODO: Make this body typed? maybe give it a type in the input form
					title: 'foo',
					description: 'bar', // Make this markdown later
					dates: [date.toISOString()],
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
	return (
		<div className='h-full py-6 px-9'>
			<div className='flex justify-between'>
				<DateHeading />
				<DateControls />
			</div>
			<div className='mt-6'>
				<Button
					variant='outline'
					className='text-sm font-normal'
					onClick={newToDoMutation.mutate}
				>
					Add Task <Plus className='w-4 h-4 mr-2' />
				</Button>
				<div className='mt-4'>
					<ToDoList />
				</div>
			</div>
		</div>
	);
}
