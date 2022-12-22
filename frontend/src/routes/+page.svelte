<script lang="ts">
	import type { PageData } from './$types';
	import { ResultSchema } from './schemas';

	export let data: PageData;

	export let aiActive = true;

	// SEARCH INPUT PART https://sveltematerialui.com/demo/textfield/

	let value = '';

	function doSearch() {
		alert('Search for ' + value);
	}

	function handleKeyDown(event: CustomEvent | KeyboardEvent) {
		event = event as KeyboardEvent;
		if (event.key === 'Enter') {
			doSearch();
		}
	}
</script>

<svelte:head>
	<title>Hjem</title>
	<meta name="description" content="AIvokat" />
</svelte:head>

<section>
	<h1 class="text-3xl mt-10 mb-16">Velkommen til <span class="font-bold">AIvokat</span></h1>
	<div class="flex align-middle w-full justify-left mb-2">
		<button on:click={() => aiActive = true} class={` ${aiActive && "underline" } mr-4 `}>Spør AI</button>
		<!-- <input type="checkbox" class="toggle toggle-s" checked /> -->
		<button on:click={() => aiActive = false} class={` ${!aiActive && "underline" } mr-4 `}>Søk i lovverket</button>
	</div>

	<input type="text" placeholder="Hvor mye må jeg betale i skatt om jeg tjener 400 000?" class="input input-bordered w-full" />
</section>

<section class="mt-10">
	<h3 class="text-xl">Resultater</h3>
	<!-- 
		result = {
			similarities: number,
			law_name: string,
			chapter: string,
			paragraph_body: string,
			paragraph_title: string
		}
	} -->

	<!-- Display all results as cards -->
	{#each data.results as result}
		<div class="card">
			<div class="card-body">
				<!-- <h2 class="card-title">{result.lawName}</h2>
				<h3 class="card-subtitle">{result.chapter}</h3>
				<p class="card-text">{result.paragraphTitle}</p> -->
			</div>
		</div>
	{/each}


</section>


<style>
	h1 {
		width: 100%;
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}
</style>
