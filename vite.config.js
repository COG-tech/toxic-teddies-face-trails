import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset URLs allow the same build to run on GitHub Pages,
  // Cloudflare Pages, and local preview without changing the code.
  base: "./"
});
