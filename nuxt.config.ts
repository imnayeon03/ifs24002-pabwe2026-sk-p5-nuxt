import tailwindcss from "@tailwindcss/vite";

const baseUrl =
  process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  srcDir: "src/",
  devtools: { enabled: false },
  modules: ["@pinia/nuxt"],
  css: ["~/index.css"],
  // Rute didefinisikan manual di src/routes.ts (lihat router.options.ts)
  pages: true,
  devServer: { port: Number(process.env.APP_PORT) || 3000 },
  vite: {
    plugins: [tailwindcss()],
    define: { DELCOM_BASEURL: JSON.stringify(baseUrl) },
  },
  app: {
    head: {
      htmlAttrs: { lang: "id" },
      title: "Delcom Cash Flow",
      meta: [
        {
          name: "description",
          content:
            "Delcom Cash Flow: aplikasi pencatatan arus kas untuk memantau pemasukan, pengeluaran, dan saldo kas, tabungan, serta pinjaman.",
        },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
          media: "print",
          onload: "this.media='all'",
        },
      ],
    },
  },
});
