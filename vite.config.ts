import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
// import { defineConfig, loadEnv } from 'vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});


// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd());
//   return {
//     define: {
//       __WEBHOOK_URL__: JSON.stringify(env.VITE_WEBHOOK_URL)
//     },
// 	plugins: [tailwindcss(), sveltekit()]
//   };
// });
