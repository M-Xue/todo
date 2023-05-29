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
	const newToDoMutation = useMutation({
		mutationFn: async (data: z.infer<typeof createToDoFormSchema>) => {
			return fetch('http://localhost:8080/api/todo/item', {
				method: 'POST',
				body: JSON.stringify({
					// TODO: Make this body typed? maybe give it a type in the input form
					title: data.title,
					description: data.description, // Make this markdown later
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

	const form = useForm<z.infer<typeof createToDoFormSchema>>({
		resolver: zodResolver(createToDoFormSchema),
		defaultValues: {
			title: '',
			description: '',
		},
	});

	function onSubmit(values: z.infer<typeof createToDoFormSchema>) {
		console.log(values);
		newToDoMutation.mutate(values);
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

				<Button type='submit' onClick={closeModal}>
					Save task
				</Button>
			</form>
		</Form>
	);
}
