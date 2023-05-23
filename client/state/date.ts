import { create } from 'zustand';
import { addDays } from 'date-fns';

type DateStore = {
	date: Date;
	resetDate: () => void;
	setDate: (date: Date | undefined) => void;

	addDate: (days: number) => void;
	minusDate: (days: number) => void;
	incrementDate: () => void;
	decrementDate: () => void;
};

export const useDateStore = create<DateStore>((set) => ({
	date: new Date(),
	resetDate: () => set({ date: new Date() }),
	setDate: (date: Date | undefined) => {
		if (date) set({ date: date });
	},

	addDate: (days: number) =>
		set((state) => ({ date: addDays(state.date, days) })),
	minusDate: (days: number) =>
		set((state) => ({ date: addDays(state.date, -days) })),
	incrementDate: () => set((state) => ({ date: addDays(state.date, 1) })),
	decrementDate: () => set((state) => ({ date: addDays(state.date, -1) })),
}));
