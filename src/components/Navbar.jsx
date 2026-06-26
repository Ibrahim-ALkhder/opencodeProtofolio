import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navLinks } from "../data/data";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e, link) => {
    e.preventDefault();
    setMenuOpen(false);

    if (link.href === "/") {
      if (location.pathname !== "/") {
        navigate("/");
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (link.href.startsWith("/#")) {
      const hash = link.href.replace("/#", "");
      if (location.pathname !== "/") {
        navigate("/", { state: { scrollTo: hash } });
      } else {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-10"
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/50 bg-white/55 px-5 py-3 shadow-soft backdrop-blur-xl sm:px-7">
        <Link
          to="/"
          className="font-serif text-xl tracking-wide text-textPrimary"
        >
          Ibrahim
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isHashLink = link.href.startsWith("/#");
            const isActive =
              location.pathname === link.href ||
              (link.href === "/" && location.pathname === "/");

            if (isHashLink || link.href === "/") {
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleClick(e, link)}
                  className={`text-sm font-medium transition duration-300 hover:text-textPrimary ${
                    isActive ? "text-textPrimary" : "text-textSecondary"
                  }`}
                >
                  {link.name}
                </a>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium transition duration-300 hover:text-textPrimary ${
                  location.pathname === link.href
                    ? "text-textPrimary"
                    : "text-textSecondary"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/message/GT3T22INBDVFH1"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-[#151515] px-4 py-2 text-sm font-medium text-white transition duration-300 hover:scale-[1.02] hover:bg-black md:inline-block"
          >
            Let&apos;s Talk
          </a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/80 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <div className="flex flex-col items-center gap-1">
              <span
                className={`block h-[2px] w-5 bg-textPrimary transition-all duration-300 ${
                  menuOpen ? "translate-y-[3px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-5 bg-textPrimary transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-5 bg-textPrimary transition-all duration-300 ${
                  menuOpen ? "-translate-y-[3px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-40 rounded-3xl border border-white/50 bg-white/90 px-6 py-8 shadow-xl backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const isHashLink = link.href.startsWith("/#");

                if (isHashLink || link.href === "/") {
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleClick(e, link)}
                      className="rounded-2xl px-4 py-3 text-base font-medium text-textSecondary transition-colors hover:bg-white/60 hover:text-textPrimary"
                    >
                      {link.name}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-base font-medium text-textSecondary transition-colors hover:bg-white/60 hover:text-textPrimary"
                  >
                    {link.name}
                  </Link>
                );
              })}

              <a
                href="https://wa.me/message/GT3T22INBDVFH1"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 rounded-full bg-[#151515] px-4 py-3 text-center text-sm font-medium text-white"
              >
                Let&apos;s Talk
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
