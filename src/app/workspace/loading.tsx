export default function WorkspaceLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#080808] text-[#d9c2b6]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-2 border-[#C07040] border-t-transparent" />
        <p className="font-mono text-sm uppercase tracking-widest">Initializing Terminal...</p>
      </div>
    </div>
  );
}
