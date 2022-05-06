import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className="h-full">
      <Head>
        <script src="/tailwind-3.0.24.min.js"></script>
      </Head>
      <body className="bg-stone-100 h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
