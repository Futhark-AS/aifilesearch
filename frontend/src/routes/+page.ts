// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;

import { env } from '$env/dynamic/public';
// import { envVars } from 'src/routes/env-vars';
import { string, z } from 'zod';
import type { PageLoad } from './$types';
import { ResultSchema } from './schemas';

export const load = (async ({ params }) => {
	// const result = await fetch(env.PUBLIC_API_URL + `/search/${query}`);
	// const results = await result.json();

	const parsedResults = z.array(ResultSchema).parse([]);

	return {
		results: parsedResults,
		response: ''
	};
}) satisfies PageLoad;
