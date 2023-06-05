import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { ReactNode } from 'react';

export default function DraggableWrapper({
	children,
	id,
}: {
	children: ReactNode;
	id: UniqueIdentifier;
}) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: id });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};
	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			{children}
		</div>
	);
}
