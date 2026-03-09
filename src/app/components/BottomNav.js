"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    // Helper to determine if a link is active
    // Simple equality check or check if it starts with the path if you have sub-routes
    const isActive = (path) => pathname === path;

    return (
        <nav className="fixed-bottom bg-white border-top py-3" style={{ backgroundColor: "#E2DAC4" }}>
            <div className="container">
                <div className="row text-center">
                    <div className="col">
                        <Link href="/mainpage" className={`text-decoration-none ${isActive('/mainpage') ? 'text-primary' : 'text-dark'}`}>
                            <i className={`bi ${isActive('/mainpage') ? 'bi-house-door-fill' : 'bi-house-door'} fs-3`}></i>
                        </Link>
                    </div>
                    <div className="col">
                        <Link href="/orderspage" className={`text-decoration-none ${isActive('/orderspage') ? 'text-primary' : 'text-dark'}`}>
                            <i className={`bi ${isActive('/orderspage') ? 'bi-bell-fill' : 'bi-bell'} fs-3`}></i>
                        </Link>
                    </div>
                    <div className="col">
                        <Link href="/Activedeliveries" className={`text-decoration-none ${isActive('/Activedeliveries') ? 'text-primary' : 'text-dark'}`}>
                            <i className={`bi ${isActive('/Activedeliveries') ? 'bi-map-fill' : 'bi-map'} fs-3`}></i>
                        </Link>
                    </div>
                    <div className="col">
                        <Link href="/myprofile" className={`text-decoration-none ${isActive('/myprofile') ? 'text-primary' : 'text-dark'}`}>
                            <i className={`bi ${isActive('/myprofile') ? 'bi-person-fill' : 'bi-person'} fs-3`}></i>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
