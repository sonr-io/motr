import React from "react";
import { MenuIcon } from "lucide-react";
import { Sheet, SheetContent } from "./sheet";
import { Button, buttonVariants } from "./button";
import { SonrIcon } from "./sonr-icon";
import { cn } from "../../lib/utils";

export function FloatingHeader() {
  const [open, setOpen] = React.useState(false);

  const links = [
    {
      label: "Docs",
      href: "https://sonr.dev",
    },
    {
      label: "About",
      href: "https://sonr.io",
    },
    {
      label: "Changelog",
      href: "https://x.com/sonr_io",
    },
  ];

  return (
    <header
      className={cn(
        "sticky top-5 z-50",
        "mx-auto w-full max-w-2xl rounded-2xl border border-border/50",
        "bg-white/30 dark:bg-black/50 backdrop-blur-xl",
      )}
    >
      <nav className="mx-auto flex items-center justify-between px-3 py-1.5">
        <div className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 duration-100">
          <SonrIcon className="size-4" />
          <p className="font-mono text-sm font-bold">Sonr</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <a
                key={link.label}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setOpen(!open)}
              className="lg:hidden"
            >
              <MenuIcon className="size-3.5" />
            </Button>
            <SheetContent
              className="bg-white/30 dark:bg-black/50 backdrop-blur-xl gap-0"
              showClose={false}
              side="left"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 px-6 pt-6 pb-8">
                  <SonrIcon className="size-6" />
                  <p className="font-mono text-lg font-bold">Sonr</p>
                </div>
                <nav className="flex-1 px-4">
                  <div className="flex flex-col gap-2">
                    {links.map((link) => (
                      <a
                        key={link.label}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "lg",
                          className: "justify-start text-base",
                        })}
                        href={link.href}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
