'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddItemForm from './AddItemForm';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export function AddItemDialog() {
	let [isOpen, setIsOpen] = useState<boolean>(false);

	function closeModal() {
		setIsOpen(false);
	}

	function openModal() {
		setIsOpen(true);
	}
	return (
		<>
			<Button
				variant='outline'
				className='text-sm font-normal'
				type='button'
				onClick={openModal}
			>
				<span className='mr-2'>Add Task</span>{' '}
				<Plus className='w-4 h-4' />
			</Button>

			<Transition appear show={isOpen} as={Fragment}>
				<Dialog as='div' className='relative z-10' onClose={closeModal}>
					<Transition.Child
						as={Fragment}
						enter='ease-out duration-300'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='ease-in duration-200'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'
					>
						<div className='fixed inset-0 bg-black bg-opacity-25' />
					</Transition.Child>

					<div className='fixed inset-0 overflow-y-auto'>
						<div className='flex items-center justify-center min-h-full p-4 text-center'>
							<Transition.Child
								as={Fragment}
								enter='ease-out duration-300'
								enterFrom='opacity-0 scale-95'
								enterTo='opacity-100 scale-100'
								leave='ease-in duration-200'
								leaveFrom='opacity-100 scale-100'
								leaveTo='opacity-0 scale-95'
							>
								<Dialog.Panel className='w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl'>
									<Dialog.Title
										as='h3'
										className='text-lg font-medium leading-6 text-gray-900'
									>
										New Task
									</Dialog.Title>

									{/* // ****************** FORM BODY ******************* */}
									{/* // ****************** FORM BODY ******************* */}
									<AddItemForm closeModal={closeModal} />
									{/* // ****************** FORM BODY ******************* */}
									{/* // ****************** FORM BODY ******************* */}
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
}
