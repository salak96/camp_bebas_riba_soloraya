import { Link } from "react-router-dom"

export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/logo.png" alt="CBR Indonesia" className={className} />
    </Link>
  )
}
