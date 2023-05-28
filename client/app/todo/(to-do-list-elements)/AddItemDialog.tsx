import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDateStore } from '@/state/date';
import { SyntheticEvent } from 'react';

export function AddItemDialog() {
	const date = useDateStore((state) => state.date);

	const queryClient = useQueryClient();
	const newToDoMutation = useMutation({
		mutationFn: async (event: SyntheticEvent) => {
			event.preventDefault();
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
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='outline' className='text-sm font-normal'>
					<span className='mr-2'>Add Task</span>{' '}
					<Plus className='w-4 h-4' />
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>New Task</DialogTitle>
				</DialogHeader>

				{/* **************************************************** */}
				{/* **************************************************** */}
				<div className='grid gap-4 py-4'>
					<div className='grid items-center grid-cols-4 gap-4'>
						<Label htmlFor='name' className='text-right'>
							Task
						</Label>
						<Input
							id='name'
							value='Pedro Duarte'
							className='col-span-3'
						/>
					</div>
					<div className='grid items-center grid-cols-4 gap-4'>
						<Label htmlFor='username' className='text-right'>
							Description
						</Label>
						<Input
							id='username'
							value='@peduarte'
							className='col-span-3'
						/>
					</div>
				</div>
				{/* **************************************************** */}
				{/* **************************************************** */}

				<DialogFooter>
					<Button type='submit' onClick={newToDoMutation.mutate}>
						Save task
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
