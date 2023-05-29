'use client';

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
