'use client';
import React, { useEffect, useRef } from 'react';
import ToDoList from './(to-do-list-elements)/ToDoList';
import DateControls from './(date-elements)/DateControls';
import DateHeading from './(date-elements)/DateHeading';
import { AddItemDialog } from './(add-todo-dialog)/AddItemDialog';
import { InputReactHookForm } from './(add-todo-dialog)/TestForm';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';

// Calendar and weekday goes in ToDoContainer
export default function ToDoContainer() {
	const scrollableTopRef = useRef<HTMLDivElement | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const entry = useIntersectionObserver(scrollableTopRef, {
		root: scrollContainerRef.current,
	});

	useEffect(() => {
		console.log(`Render Section ${entry?.isIntersecting}`);
		return () => {};
	}, [entry?.isIntersecting]);

	return (
		<div className='flex flex-col h-full pt-6 '>
			<div className='flex justify-between px-9'>
				<DateHeading />
				<DateControls />
			</div>
			<div
				className={`px-2 pb-3 mx-7 transition-shadow [clip-path:inset(0px_0px_-3px);] ${
					entry?.isIntersecting ? '' : 'shadow-bottom'
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
					<ToDoList />
				</div>
			</div>
		</div>
	);
}
