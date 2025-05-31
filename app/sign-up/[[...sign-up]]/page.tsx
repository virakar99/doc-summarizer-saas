import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="mt-2 text-gray-600">Get started with DocSummarize AI</p>
        </div>
        <SignUp appearance={{ elements: { rootBox: "mx-auto" } }} />
      </div>
    </div>
  )
}
