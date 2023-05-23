import React from 'react';
import { useDateStore } from '@/state/date';
import { format } from 'date-fns';
export default function DateHeading() {
	const date = useDateStore((state) => state.date);
	return (
		<div>
			<div>{format(date, 'd LLLL y')}</div>
			<div>{format(date, 'EEEE')}</div>
		</div>
	);
}
