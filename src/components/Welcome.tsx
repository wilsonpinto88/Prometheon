const Welcome = () => {
  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-500 mb-4">
          Welcome to Prometheon! 🚀
        </h1>
        <p className="text-gray-300 mb-8">
          Your React learning journey begins here. Let's build something amazing together!
        </p>
        
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="text-gray-400 mb-4">
            This is your first React component. Try clicking the button below!
          </p>
        </div>

        <div className="mt-8 bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Read the <code className="bg-dark-surface px-2 py-1 rounded">Docs/06-Learning-Roadmap.md</code> file</li>
            <li>Follow Step 1: Project Setup (you're here!)</li>
            <li>Move to Step 2: Create your first component</li>
            <li>Ask questions as you code - I'm here to help!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default Welcome