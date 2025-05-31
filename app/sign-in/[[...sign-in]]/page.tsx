import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">Welcome back to DocSummarize AI</p>
        </div>
        <SignIn appearance={{ elements: { rootBox: "mx-auto" } }} />
      </div>
    </div>
  )
}
