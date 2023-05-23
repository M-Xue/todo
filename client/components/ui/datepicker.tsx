'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { useDateStore } from '@/state/date';

export function DatePicker() {
	// const [date, setDate] = React.useState<Date>();
	const [date, setDate] = useDateStore((state) => [
		state.date,
		state.setDate,
	]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					className={cn(
						'w-[280px] justify-start text-left font-normal'
						// !date && 'text-muted-foreground'
					)}
				>
					<CalendarIcon className='w-4 h-4 mr-2' />
					{/* {date ? format(date, 'PPP') : <span>Pick a date</span>} */}
					{<span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0'>
				<Calendar
					mode='single'
					selected={date}
					onSelect={setDate}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
