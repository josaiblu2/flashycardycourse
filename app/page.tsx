export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#0f172a] px-6 py-16">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-white">Welcome to </span>
            <span className="text-blue-500">Flashy Cardy Course</span>
          </h1>
          <p className="max-w-2xl text-lg font-normal leading-relaxed text-slate-400">
            Master any subject with our interactive flashcard learning system.
            Create, study, and track your progress all in one place.
          </p>
        </div>

        <div className="w-full max-w-xl rounded-xl bg-card px-8 py-10 text-center">
          <h2 className="text-xl font-bold text-white">Get Started Today</h2>
          <div className="mt-4 space-y-3 text-base font-normal leading-relaxed text-slate-400">
            <p>
              Sign up or sign in to start creating your personalized flashcard
              decks.
            </p>
            <p className="text-sm text-slate-500">
              Click the buttons in the header above to get started! 👇
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
