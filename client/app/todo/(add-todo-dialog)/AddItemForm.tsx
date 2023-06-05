import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDateStore } from '@/state/date';
import { SyntheticEvent } from 'react';
import { useForm } from 'react-hook-form';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/react-hook-form/form';
import { LexoRank } from 'lexorank';
import { ResponseGetToDoByDate, ToDoItemWithRank } from '@/types/typeshare';

const createToDoFormSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string(),
	// dates: z.string().array(),
});

export default function AddItemForm({
	closeModal,
}: {
	closeModal: () => void;
}) {
	const date = useDateStore((state) => state.date);

	const queryClient = useQueryClient();

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


	// console.log(queryClient.getQueryData(['todos-by-date', date.toISOString().substring(0, 10)])) // Getting the current list of items
	function generateRank(): string {
		const currDateItems = queryClient.getQueryData<ResponseGetToDoByDate>(['todos-by-date', date.toISOString().substring(0, 10)]);

		if (!currDateItems || currDateItems.items.length == 0) {
			return LexoRank.middle().toString();
		} else {
			
			const finalIndex = currDateItems.items.length - 1;
			return LexoRank.parse(sortToDoRanks([...currDateItems.items])[finalIndex].rank).genNext().toString()
		}

	}

	const newToDoMutation = useMutation({
		mutationFn: async (data: z.infer<typeof createToDoFormSchema>) => {
			return fetch('http://localhost:8080/api/todo/item', {
				method: 'POST',
				body: JSON.stringify({
					// TODO: Make this body typed? maybe give it a type in the input form
					title: data.title,
					description: data.description, // Make this markdown later
					dates: [[date.toISOString(), generateRank()]], /* This second one should be rank. Since we are creating a new to do, it should go at the bottom (last items rank.genNext()). */
					// Its an array within an array because the inner array is the ISO string data and item rank pair while the other array lets us put multiple date/rank pairs in the future
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

	const form = useForm<z.infer<typeof createToDoFormSchema>>({
		resolver: zodResolver(createToDoFormSchema),
		defaultValues: {
			title: '',
			description: '',
		},
	});

	function onSubmit(values: z.infer<typeof createToDoFormSchema>) {
		newToDoMutation.mutate(values);
		closeModal();
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='grid gap-4 py-4'
				autoComplete='off'
			>
				<FormField
					control={form.control}
					name='title'
					render={({ field }) => (
						<FormItem className=''>
							{/* <FormLabel>Task Title</FormLabel> */}
							<FormControl>
								<Input
									placeholder='Task title'
									className=''
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='description'
					render={({ field }) => (
						<FormItem className=''>
							{/* <FormLabel>Description</FormLabel> */}
							<FormControl>
								<Textarea
									placeholder='Add description...'
									className='resize-none'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type='submit'>Save task</Button>

				{/* <DialogClose>
					<Button type='submit'>Save task</Button>
				</DialogClose> */}
			</form>
		</Form>
	);
}
