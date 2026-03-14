import { Card } from '@/components/ui/card'
import { SignupForm } from '@/components/auth/signup-form'
import { Building2 } from 'lucide-react'

export default function SignupPage() {
  return (
    <Card padding="lg">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-1 text-sm text-gray-500">Get started with BOQ Platform</p>
      </div>

      <SignupForm />
    </Card>
  )
}
