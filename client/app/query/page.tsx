'use client';
import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';

export default function Page() {
	const postsQuery = useQuery({
		queryKey: ['todos'],
		queryFn: async () => {
			return fetch(
				'http://localhost:8080/api/todo/date/2023-05-25T12:20:10.997Z'
			).then((res) => res.json());
		},
	});

	const queryClient = useQueryClient();
	const newPostMutation = useMutation({
		mutationFn: async () => {
			return fetch('http://localhost:8080/api/todo/item', {
				method: 'POST',
				body: JSON.stringify({
					title: 'foo',
					description: 'bar', // Make this markdown later
					dates: ['2023-05-25T12:20:10.997Z'],
				}),
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		},
		onSuccess: () => queryClient.invalidateQueries(['todos']),
	});

	if (postsQuery.isLoading) return <h1>Loading...</h1>;
	if (postsQuery.isError)
		return <pre>{JSON.stringify(postsQuery.error)}</pre>;

	return (
		<div>
			<div>Test</div>
			<button type='button' onClick={() => newPostMutation.mutate()}>
				Click to add
			</button>
			<div>{JSON.stringify(postsQuery.data)}</div>
			<Checkbox />
		</div>
	);
}
