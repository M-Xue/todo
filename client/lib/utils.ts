import { ToDoItemWithRank } from '@/types/typeshare';
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// * shadcn/ui util
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// * Personal util
export function sortToDoRanks(list: ToDoItemWithRank[]) {
	return list.sort((a, b) => {
		if (a.rank < b.rank) {
			return -1;
		}
		if (a.rank > b.rank) {
			return 1;
		}
		return 0;
	});
}
