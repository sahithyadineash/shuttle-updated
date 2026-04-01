import { useAuth } from "../hooks/useAuth"

export default function Profile() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <p className="text-slate-600">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200/80">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-700 text-3xl font-semibold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          {user.name}
        </h1>
        <p className="mt-1 text-center text-sm capitalize text-slate-500">
          {user.role}
        </p>

        <dl className="mt-8 space-y-3">
          <ProfileRow label="Email" value={user.email} />
          <ProfileRow
            label="Phone"
            value={user.phone?.trim() ? user.phone : "—"}
          />
        </dl>
      </div>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}
