import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to TripTally</h1>
        <p className="mb-8 text-xl text-gray-600">
          Plan your trips and manage expenses with ease
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
