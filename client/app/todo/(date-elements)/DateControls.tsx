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
			<div className='flex items-center'>
				<span className='mr-3'>
					<Button
						variant='outline'
						onClick={decrementDate}
						className='mx-1'
					>
						<ChevronLeft className='w-4 h-4' />
					</Button>
					<Button
						variant='outline'
						onClick={incrementDate}
						className='mx-1'
					>
						<ChevronRight className='w-4 h-4' />
					</Button>
				</span>
				<Button
					variant='outline'
					onClick={resetDate}
					className='mr-3 text-sm font-normal'
				>
					Today
				</Button>
				<DatePicker />
			</div>
		</div>
	);
}
