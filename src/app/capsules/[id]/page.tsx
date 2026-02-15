export default async function CapsuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif">Capsule {id}</h1>
        <p className="text-zinc-500">Memories for this capsule will appear here.</p>
        <p className="text-sm text-zinc-400">Placeholder for future implementation.</p>
      </div>
    </div>
  )
}
