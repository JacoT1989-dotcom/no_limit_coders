import { Navbar } from "./_components/Navbar";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
