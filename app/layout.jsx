import "../src/styles.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-800.css";

export const metadata = {
  title: "RoboNerve / Emergency Response Command",
  description: "Role-based drone and robot command system for search, rescue, and medical response.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e9edf0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
