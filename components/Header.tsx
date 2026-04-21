import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-[#222222]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] rounded-lg">
          <Image
            src="/logo.png"
            alt="DiarioIA logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            Diario<span className="text-[#00E5FF]">IA</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="https://t.me/diariodeia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-[#00E5FF] text-[#00E5FF] text-sm font-medium rounded-full hover:bg-[#00E5FF] hover:text-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Unirse al canal de Telegram de DiarioIA"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
            </svg>
            <span className="hidden sm:inline">Únete al canal</span>
            <span className="sm:hidden">Telegram</span>
          </a>
        </div>
      </div>
    </header>
  );
}
