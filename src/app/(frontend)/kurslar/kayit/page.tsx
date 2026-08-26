import type { Metadata } from "next";
import RegistrationForm from "./RegistrationForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Kayıt Formu Kurslar",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function KayitPage({ searchParams }: { searchParams: Record<string, string> }) {
  const orderToken = searchParams?.order ?? "";
  return (
    <main className="bg-gradient-to-b from-[#f0f7ff] to-white min-h-screen">
      <Header />
      <section className="max-w-2xl mx-auto px-6 py-16">
        <RegistrationForm orderToken={orderToken} />
      </section>
      <Footer />
    </main>
  );
}
