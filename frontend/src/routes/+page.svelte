<script lang="ts">
	import type { PageData } from './$types';
	import type { LawResult } from './schemas';

	//import open ai gpt-3
	const apiKey = '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';

	export let data: PageData;

	export let aiActive = true;

	// SEARCH INPUT PART https://sveltematerialui.com/demo/textfield/

	let value = '';

	function zip(obj: { [key: string]: { [key: string]: any } }): LawResult[] {
		const keys = Object.keys(obj);
		const result: { [key: string]: any }[] = [];

		for (const id of Object.keys(obj[keys[0]])) {
			const item: { [key: string]: any } = { id };
			for (const key of keys) {
				item[key] = obj[key][id];
			}
			result.push(item);
		}

		// Group the items by law name
		const grouped = result.reduce((acc, curr) => {
			if (!acc[curr.law_name]) {
				acc[curr.law_name] = [];
			}
			acc[curr.law_name].push(curr);
			return acc;
		}, {});

		// Convert the grouped object into an array
		const groupedArray: { law_name: string; items: { [key: string]: any }[] }[] = [];
		for (const lawName of Object.keys(grouped)) {
			groupedArray.push({
				law_name: lawName,
				items: grouped[lawName]
			});
		}

		return groupedArray;
	}

	async function normalSearch() {
		const request = { prompt: value };
		// https://nlp-search-api.azurewebsites.net/api/search
		// http://localhost:7071/api/search 
		const res = await fetch('https://nlp-search-api.azurewebsites.net/api/search', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				//no cors
				//'Access-Control-Allow-Origin': '*'
			},
			body: JSON.stringify(request)
		});
		const parsed = await res.json();
		console.log('Done');
		data.results = zip(parsed);
		console.log(data.results);
	}

	async function aiSearch() {
		//First: Use the normalSearch method to get the results
		await normalSearch();
		//Then: Use the results combined with the prompt to get the answer from GPT-3
		//Use gpt-3 from openai to get the answer

		//Get the first 3 laws from data.results

		const laws = data.results;

		let prompt = `The user input is: ${value}. Given the following relevant Norwegian laws in JSON format, answer the user as best as you can: ${JSON.stringify(laws)}. Your answer:`;
		console.log(prompt.length);
		console.log(prompt)

		while (prompt.length / 3 > 2750) {
			if (laws[laws.length-1].items.length != 0){
				laws[laws.length-1].items.pop();
			}
			else{
				laws.pop();
			}
			prompt = `The user input is: ${value}. Given the following relevant Norwegian laws in JSON format, answer the user as best as you can: ${JSON.stringify(laws)}. Your answer:`;
			console.log(prompt.length);
		}

		const params = {
			model: 'text-davinci-003',
			prompt: prompt,
			max_tokens: 512,
			temperature: 0.3
		};
		const requestOptions: any = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + apiKey
			},
			body: JSON.stringify(params)
		};
		// first, list all available models
		
		const res_models = await fetch('https://api.openai.com/v1/models', requestOptions);
		const models = await res_models.json();
		console.log(models)

		const response = await fetch('https://api.openai.com/v1/completions', requestOptions);
		console.log(response);
		const json = await response.json();
		console.log(json);
		const text = json.choices[0].text;

		console.log(text);
		data.response = text;
	}

	function doSearch() {
		if (aiActive) {
			aiSearch();
		} else {
			normalSearch();
		}
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

<svelte:window on:keydown={handleKeyDown} />

<section>
	<h1 class="text-3xl mt-10 mb-16">Velkommen til <span class="font-bold">AIvokaten</span></h1>
	<div class="flex align-middle w-full justify-left mb-2">
		<button
			on:click={() => (aiActive = true)}
			class={`${
				aiActive && `bg-orange-600 text-white`
			} mr-4 underline font-bold py-2 px-4 rounded `}>Spør AI</button
		>
		<!-- <input type="checkbox" class="toggle toggle-s" checked /> -->
		<button
			on:click={() => (aiActive = false)}
			class={`${
				!aiActive && `bg-orange-600 text-white`
			} mr-4 underline font-bold py-2 px-4 rounded `}>Søk i lovverket</button
		>
	</div>

	<input
		type="text"
		placeholder="Eks: Hvor mye må jeg betale i skatt om jeg tjener 400 000?"
		class="input input-bordered w-full"
		bind:value
	/>
</section>

<section class="mt-10">
	<h3 class="text-xl">Resultater</h3>
	<!-- 
		result = {
			similarities: number,
			law_name: string,
			chapter: string,
			paragraph: string,
			paragraph_title: string
		}
	} -->


	{#if aiActive}
		<div class="card">
			<div class="card-body">
				<h3 class="card-subtitle">Svar fra AI</h3>
				<p class="card-text">{data.response}</p>
			</div>
		</div>
	{/if}
	{#if !aiActive}
			{#each data.results as lawGroup}
			<h1 class="card-law-name">{lawGroup.law_name}</h1>
			{#each lawGroup.items as item}
				<div class="card">
					<div class="card-body">
						<h3 class="card-subtitle">{item.chapter}</h3>
						<p class="card-text">{item.paragraph_title}</p>
						<p class="card-text">{item.paragraph.length > 256 ? `${item.paragraph.slice(0, 256)}...` : item.paragraph}</p>
					</div>
				</div>
			{/each}
		{/each}
	{/if}
</section>

<style>
	h1 {
		width: 100%;
		font-family: 'Raleway', sans-serif;
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.card-law-name {
		position: relative;
		font-size: 24px;
		font-weight: 600;
		margin: 20px 0 8px 0;
		color: #333333;
		text-transform: uppercase;
		text-align: left;
	}

	.card-law-name:before {
		content: '';
		color: rgba(0, 0, 0, 0.1);
		display: inline-block;
		width: 64px;
		height: 64px;
		background-image: url('../lib/images/law.svg');
		background-size: cover;
		position: absolute;
		top: 50%;
		left: -80px;
		transform: translateY(-50%);
	}

	.card {
		max-width: 800px;
		margin: 0 auto 20px auto;
		width: 100%;
		border-radius: 6px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		background-color: #ffffff;
		position: relative;
		padding: 0px 20px 0px 20px ;
	}
</style>
