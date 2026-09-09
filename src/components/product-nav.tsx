"use client";

import Link from "next/link";
import { useCvStore } from "@/store/cv-store";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useDisplayLanguage } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ProductNav() {
  const openEditor = useCvStore(s => s.openEditor);
  const setMobileView = useCvStore(s => s.setMobileView);
  const showTemplates = () => { openEditor(); setMobileView("preview"); };
  const tr = useDisplayLanguage() === "TR";
  const { resolvedTheme, setTheme } = useTheme();
  const links = [["/#tools", tr ? "Araçlar" : "Tools"], ["/studio#resume-template-label", tr ? "CV şablonları" : "CV templates"], ["/guides", tr ? "Rehberler" : "Guides"]];
  return <>
    <nav aria-label={tr ? "Ana menü" : "Main navigation"} className="hidden items-center gap-5 text-sm font-semibold xl:flex">
      {links.map(([href, label]) => <Link key={href} href={href} onClick={href.startsWith("/studio") ? showTemplates : undefined} className="py-2 hover:text-primary">{label}</Link>)}
    </nav>
    <Button size="icon" variant="ghost" aria-label={tr ? "Temayı değiştir" : "Toggle theme"} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}><Moon className="dark:hidden" /><Sun className="hidden dark:block" /></Button>
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon" variant="ghost" className="xl:hidden" aria-label={tr ? "Menüyü aç" : "Open menu"} />}><Menu /></DropdownMenuTrigger>
      <DropdownMenuContent align="end">{links.map(([href, label]) => <DropdownMenuItem key={href} render={<Link href={href} onClick={href.startsWith("/studio") ? showTemplates : undefined} />}>{label}</DropdownMenuItem>)}</DropdownMenuContent>
    </DropdownMenu>
  </>;
}
