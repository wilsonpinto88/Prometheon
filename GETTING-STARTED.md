# Getting Started with Prometheon 🚀

Welcome! This guide will help you set up the project and start your React learning journey.

## Step 1: Install Dependencies

First, make sure you have Node.js installed (version 18 or higher).

Then, install the project dependencies:

```bash
# If you have pnpm (recommended)
pnpm install

# Or with npm
npm install

# Or with yarn
yarn install
```

## Step 2: Start the Development Server

Run the development server:

```bash
pnpm dev
# or
npm run dev
```

You should see something like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

You should see a welcome page with a counter button - this is your first React app running! 🎉

## Step 3: Explore the Project Structure

Take a moment to explore what we've set up:

```
Prometheon/
├── Docs/                    # All documentation
│   ├── 06-Learning-Roadmap.md  ⭐ START HERE
│   ├── 07-Quick-Reference.md   📚 Keep this handy
│   └── ...
├── src/
│   ├── App.tsx              # Main app component (you'll edit this)
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles (Tailwind)
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Step 4: Read the Learning Roadmap

**This is important!** Open `Docs/06-Learning-Roadmap.md` and read through it. This is your step-by-step guide for learning React while building Prometheon.

The roadmap is divided into phases:
- **Phase 1**: React Fundamentals (Week 1-2)
- **Phase 2**: Building Prometheon UI (Week 3-4)
- **Phase 3**: React Hooks & State Management (Week 5-6)
- **Phase 4**: Advanced Features (Week 7-8)
- **Phase 5**: Polish & Best Practices (Week 9-10)

## Step 5: Start Coding!

### Your First Task: Modify App.tsx

1. Open `src/App.tsx` in your editor
2. Try changing the text in the `<h1>` tag
3. Save the file
4. Watch it update in your browser (hot reload!)

### Next Steps

Follow the roadmap in `Docs/06-Learning-Roadmap.md`:
- **Step 1**: ✅ Project Setup (you're here!)
- **Step 2**: Create your first component
- **Step 3**: Learn about props
- And so on...

## Quick Reference

As you code, keep `Docs/07-Quick-Reference.md` open. It has:
- Common React patterns
- Code examples
- TypeScript syntax
- Tailwind CSS examples
- Debugging tips

## Getting Help

### Common Issues

**Problem**: `pnpm: command not found`
- **Solution**: Install pnpm: `npm install -g pnpm`
- Or use `npm` instead

**Problem**: Port 5173 already in use
- **Solution**: Vite will automatically use the next available port
- Or change it in `vite.config.ts`

**Problem**: TypeScript errors
- **Solution**: Run `pnpm type-check` to see all errors
- Most errors are helpful - read them!

### Questions?

As you code, ask me:
- "How do I...?"
- "Why does this happen?"
- "What's the best way to...?"
- "Can you explain this concept?"

I'm here to help you learn! 🎓

## Development Tips

1. **Keep the browser DevTools open** - Check the Console tab for errors
2. **Use React DevTools** - Install the browser extension for debugging
3. **Save often** - Vite will hot-reload your changes
4. **Read error messages** - They usually tell you exactly what's wrong
5. **Experiment** - Try things, break things, learn from mistakes!

## What's Next?

1. ✅ You've set up the project
2. ✅ You've started the dev server
3. ✅ You've seen your first React app
4. 📖 Read `Docs/06-Learning-Roadmap.md`
5. 🎯 Start with Step 2: Create your first component

---

**Ready to code?** Let's build Prometheon together! 🚀

