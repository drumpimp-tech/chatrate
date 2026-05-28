import Image from "next/image"
import Link from "next/link"

export function Logo({ size = 52, href = "/" }: { size?: number; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group">
      <Image
        src="/icon.png"
        alt="ChatRate"
        width={size}
        height={size}
        className="rounded-xl"
        priority
      />
      <span className="text-xl font-bold tracking-tight">
        Chat<span className="text-purple-500">Rate</span>
      </span>
    </Link>
  )
}
