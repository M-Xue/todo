'use client';
import React, { useEffect, useRef, useState } from 'react';
import ToDoList from './(to-do-list-elements)/ToDoList';
import DateControls from './(date-elements)/DateControls';
import DateHeading from './(date-elements)/DateHeading';
import { AddItemDialog } from './(add-todo-dialog)/AddItemDialog';
import { InputReactHookForm } from './(add-todo-dialog)/TestForm';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import { ToDoItemWithRank } from '@/types/typeshare';

// Calendar and weekday goes in ToDoContainer
export default function ToDoContainer() {
	const scrollableTopRef = useRef<HTMLDivElement | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const entry = useIntersectionObserver(scrollableTopRef, {
		root: scrollContainerRef.current,
	});

	// Need to keep the list state in the container so we can check to see if the list is of length 0 since the initial value of useIntersectionObserver() is false
	const [list, setList] = useState<ToDoItemWithRank[]>([]);

	return (
		<div className='flex flex-col h-full pt-6 '>
			<div className='flex justify-between px-9'>
				<DateHeading />
				<DateControls />
			</div>
			<div
				className={`px-2 pb-3 mx-7 transition-shadow [clip-path:inset(0px_0px_-3px);] ${
					entry?.isIntersecting || list.length === 0
						? ''
						: 'shadow-bottom'
				}`}
			>
				<AddItemDialog />
			</div>

			{/* Parent Scroll Container */}
			<div
				className='flex flex-col pt-3 pb-6 overflow-y-scroll px-9 grow scrollbar-hide'
				ref={scrollContainerRef}
			>
				<div className='pt-[1px]' ref={scrollableTopRef}></div>

				{/* Scrollable Child */}
				<div className='grow'>
					<ToDoList
						list={list}
						setList={(newList: ToDoItemWithRank[]) =>
							setList(newList)
						}
					/>
				</div>
			</div>
		</div>
	);
}
