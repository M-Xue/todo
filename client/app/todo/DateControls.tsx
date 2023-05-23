import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import { useDateStore } from '@/state/date';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

export default function DateControls() {
	const [resetDate, incrementDate, decrementDate] = useDateStore((state) => [
		state.resetDate,
		state.incrementDate,
		state.decrementDate,
	]);
	return (
		<div>
			<div>
				<span>
					<Button variant='outline' onClick={decrementDate}>
						<ChevronLeft className='w-4 h-4 mr-2' />
					</Button>
					<Button variant='outline' onClick={incrementDate}>
						<ChevronRight className='w-4 h-4 mr-2' />
					</Button>
				</span>
				<Button
					variant='outline'
					onClick={resetDate}
					className='text-sm font-normal'
				>
					Today
				</Button>
				<DatePicker />
			</div>
		</div>
	);
}
