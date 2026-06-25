import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lightBg text-textPrimary px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-textSecondary mb-8">Page not found</p>
      <Link
        to="/"
        className="px-6 py-3 bg-textPrimary text-white rounded-lg hover:opacity-90 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
