import React from 'react';
import { useDateStore } from '@/state/date';
import { format } from 'date-fns';
export default function DateHeading() {
	const date = useDateStore((state) => state.date);
	return (
		<div>
			<h1 className='font-default'>{format(date, 'd LLLL y')}</h1>
			<h2 className='font-default text-slate-300'>
				{format(date, 'EEEE')}
			</h2>
		</div>
	);
}
