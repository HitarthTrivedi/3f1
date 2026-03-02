import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded-none border-foreground/20 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-smooth group"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:scale-110" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:scale-110" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-foreground/20 bg-background/80 backdrop-blur-xl">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="text-[10px] uppercase font-black tracking-widest cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="text-[10px] uppercase font-black tracking-widest cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="text-[10px] uppercase font-black tracking-widest cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
