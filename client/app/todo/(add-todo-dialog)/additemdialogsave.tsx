'use client';

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
import { Plus, Tag } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDateStore } from '@/state/date';
import { SyntheticEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import TagsSelector from './TagsSelector';

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

	// const { register, handleSubmit } = useForm();

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
							Task Title
						</Label>
						<Input
							id='name'
							// value='Pedro Duarte'
							className='col-span-3'
						/>
					</div>
					{/* <div><DatePickerWithRange/></div> */}
					<div className='grid items-center grid-cols-4 gap-4'>
						<Label htmlFor='username' className='text-right'>
							Description
						</Label>
						{/* <Input
							id='username'
							value='@peduarte'
							className='col-span-3'
						/> */}
						<Textarea
							className='col-span-3 resize-none'
							placeholder='Description...'
						/>
					</div>
					{/* <div><TagsSelector /></div> */}
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

// ***********
('use client');

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import AddItemForm from './AddItemForm';
import { useState } from 'react';

export function AddItemDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='outline' className='text-sm font-normal'>
					<span className='mr-2'>Add Task</span>{' '}
					<Plus className='w-4 h-4' />
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[800px]'>
				<DialogHeader>
					<DialogTitle>New Task</DialogTitle>
				</DialogHeader>

				{/* ************* */}
				{/* ************* */}
				<AddItemForm />
				{/* ************* */}
				{/* ************* */}
			</DialogContent>
		</Dialog>
	);
}
