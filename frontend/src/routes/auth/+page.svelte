<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let buttonDiv: HTMLDivElement;
	export let error: string = '';

	function parseJwt(token: string) {
		var base64Url = token.split('.')[1];
		var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		var jsonPayload = decodeURIComponent(
			window
				.atob(base64)
				.split('')
				.map(function (c) {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join('')
		);

		return JSON.parse(jsonPayload);
	}

	async function handleCredentialResponse(response: { credential: string }) {
		console.log('Encoded JWT ID token: ' + response.credential);
		const parsed = parseJwt(response.credential);
		// send post request to https://nlp-search-api.azurewebsites.net/.auth/login/google with body { id_token: response.credential }
		// then redirect to /search
		const res = await fetch('https://nlp-search-api.azurewebsites.net/.auth/login/google', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id_token: response.credential })
		});

		console.log(res);

		const json = await res.json();
		console.log(json);
		// store in local storage
		localStorage.setItem('uid', json.user.userId);
		localStorage.setItem('token', json.authenticationToken);

	}

	onMount(async () => {
		if (!buttonDiv) {
			console.error('No buttonDiv found, google sign in cannot load');
			return;
		}

		try {
			// @ts-ignore
			google.accounts.id.initialize({
				client_id: '1060860818910-of2mib6de089jn475e0ivlf80r849cm5.apps.googleusercontent.com',
				callback: handleCredentialResponse
			});
			// @ts-ignore
			google.accounts.id.renderButton(
				buttonDiv,
				{ theme: 'outline', size: 'large', type: 'standard' } // customization attributes
			);
			// @ts-ignore
			google.accounts.id.prompt(); // also display the One Tap dialog
		} catch (e) {
			console.error(e);
			error = 'There was a problem communicating with Google. Please try again later.';
		}
	});
</script>

<div class="w-[60ch] mx-auto flex justify-center items-center h-40">
	{#if error.length > 0}
		<div class="text-red-500">{error}</div>
	{/if}
	<div bind:this={buttonDiv} />
</div>
