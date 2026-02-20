import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Wallet, Settings, LogOut, Shield } from "lucide-react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Global Decorative Gradients */}
            <div className="fixed top-0 left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-[-10%] w-[40%] h-[40%] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            {children}
        </div>
    );
}
