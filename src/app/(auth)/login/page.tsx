import { Card } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/login-form'
import { Building2 } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams

  return (
    <Card padding="lg">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-500">Sign in to your BOQ Platform account</p>
      </div>

      {params?.message && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 border border-blue-200">
          {params.message}
        </div>
      )}

      <LoginForm />
    </Card>
  )
}
