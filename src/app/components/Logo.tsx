'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface LogoProps {
    className?: string;
}

export default function Logo({ className }: LogoProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState<number>(9);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry && entry.contentRect.width) {
                // Calculate font size proportional to the actual measured box width
                // For a 96px width (w-24), 9px is a good base.
                const width = entry.contentRect.width;
                const calculatedSize = Math.max(7, width * 0.095);
                setFontSize(calculatedSize);
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <Link href="/">
            <div ref={containerRef} className={`flex flex-col text-center ${className}`}>
                <img src="/logo.png" alt="Logo" className="w-full h-auto" />
                <p
                    className="text-gray-500 font-medium tracking-tight"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    Kiyu Foods
                </p>
            </div>
        </Link>
    )
}

