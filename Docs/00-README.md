# Prometheon Documentation

Welcome to the Prometheon documentation. This directory contains comprehensive guides for technology stack, architecture, development procedures, and system design.

## Documentation Index

### [01-Technology-Stack.md](./01-Technology-Stack.md)
- Core technologies and tools
- Coding conventions and standards
- File organization patterns
- Development environment setup
- Performance and accessibility guidelines

### [02-Architecture.md](./02-Architecture.md)
- System architecture overview
- Application structure (feature-based)
- State management strategy
- Data flow patterns
- Component architecture
- Routing and API integration
- Performance and security considerations

### [03-Development-Procedures.md](./03-Development-Procedures.md)
- Git workflow and branching strategy
- Commit message conventions
- Code review process
- Testing procedures
- Code quality standards
- Release and deployment processes

### [04-Progress-Tracking-System.md](./04-Progress-Tracking-System.md)
- Progress tracking system design
- Data models and schemas
- State management for progress
- Progress calculation logic
- Real-time updates and synchronization
- API endpoints and services

### [05-React-Best-Practices.md](./05-React-Best-Practices.md)
- React.js best practices discussion
- Component design patterns
- Performance optimization strategies
- State management recommendations
- Common pitfalls and solutions

### [06-Learning-Roadmap.md](./06-Learning-Roadmap.md) ⭐ **START HERE**
- Step-by-step learning guide
- 24 steps from beginner to advanced
- Hands-on React learning
- Progress tracking checklist
- Perfect for learning React while building

### [07-Quick-Reference.md](./07-Quick-Reference.md) 📚
- React cheat sheet
- Common patterns and examples
- TypeScript syntax
- Tailwind CSS examples
- Debugging tips
- Keep this open while coding!

### [ProgressTracker/Session-Log.md](./ProgressTracker/Session-Log.md) 📝
- Development session tracking
- What was accomplished in each session
- Next steps and future work
- Session continuity reference
- **Update at the end of each session**

## Quick Start

1. Read [01-Technology-Stack.md](./01-Technology-Stack.md) for setup requirements
2. Review [02-Architecture.md](./02-Architecture.md) to understand the system design
3. Follow [03-Development-Procedures.md](./03-Development-Procedures.md) for development workflow
4. Reference [04-Progress-Tracking-System.md](./04-Progress-Tracking-System.md) when implementing progress features
5. Consult [05-React-Best-Practices.md](./05-React-Best-Practices.md) for React-specific guidance

## Key Decisions

### Technology Choices
- **React 18+** with TypeScript for type safety
- **Vite** for fast development and builds
- **Tailwind CSS** for styling (matches dark theme mockup)
- **Zustand** for state management (lightweight, TypeScript-friendly)
- **TanStack Query** for server state management
- **React Router v6** for routing

### Architecture Decisions
- **Feature-based structure** for better organization and scalability
- **Separation of concerns** between UI, logic, and data
- **Optimistic updates** for better UX
- **Code splitting** for performance

### Progress Tracking
- **Hybrid approach**: Zustand for client state, TanStack Query for server state
- **Optimistic updates** with rollback on error
- **Local caching** for offline support
- **Real-time synchronization** with periodic sync

## Contributing

When contributing to Prometheon:
1. Follow the coding conventions in [01-Technology-Stack.md](./01-Technology-Stack.md)
2. Adhere to the architecture patterns in [02-Architecture.md](./02-Architecture.md)
3. Follow the development procedures in [03-Development-Procedures.md](./03-Development-Procedures.md)
4. Update documentation when making significant changes

## Questions?

If you have questions about:
- **Technology choices**: See [01-Technology-Stack.md](./01-Technology-Stack.md)
- **System design**: See [02-Architecture.md](./02-Architecture.md)
- **How to contribute**: See [03-Development-Procedures.md](./03-Development-Procedures.md)
- **Progress tracking**: See [04-Progress-Tracking-System.md](./04-Progress-Tracking-System.md)
- **React patterns**: See [05-React-Best-Practices.md](./05-React-Best-Practices.md)

