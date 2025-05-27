# Contributing to My Inbox Report

Thank you for your interest in contributing to My Inbox Report! We welcome contributions from everyone, whether you're fixing bugs, adding features, improving documentation, or helping with design.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A Gmail account for testing

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/myinboxreport.git
   cd myinboxreport
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/originalowner/myinboxreport.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Add your API keys as described in README.md
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🛠️ Development Workflow

### Before You Start

1. **Check existing issues** to see if someone is already working on what you want to do
2. **Create an issue** if one doesn't exist for your planned contribution
3. **Comment on the issue** to let others know you're working on it

### Making Changes

1. **Create a new branch** from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "feat: add subscription categorization feature"
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Submitting Changes

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues
   - Provide a detailed description of your changes
   - Include screenshots for UI changes

## 📋 Code Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` types when possible

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Use Next.js App Router conventions

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Ensure responsive design
- Test in both light and dark modes

### Code Quality

- Run ESLint: `npm run lint`
- Format with Prettier: `npm run format`
- Ensure type safety: `npm run type-check`

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Ensure good test coverage for new features

## 🎨 Design Guidelines

### UI/UX Principles

- **Privacy First**: Always emphasize data privacy
- **Simplicity**: Keep interfaces clean and intuitive
- **Accessibility**: Follow WCAG guidelines
- **Performance**: Optimize for speed and efficiency

### Visual Design

- Follow the existing color scheme and typography
- Use consistent spacing and layout patterns
- Ensure proper contrast ratios
- Test with screen readers

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions and components
- Document complex logic and algorithms
- Keep comments up-to-date with code changes

### User Documentation

- Update README.md for new features
- Add setup instructions for new integrations
- Include examples and use cases

## 🐛 Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Environment details** (OS, browser, Node.js version)
- **Screenshots** if applicable
- **Console errors** if any

## 💡 Feature Requests

For feature requests, please provide:

- **Clear description** of the feature
- **Use case** and motivation
- **Proposed implementation** (if you have ideas)
- **Mockups or wireframes** (if applicable)

## 🔒 Security

### Reporting Security Issues

Please **DO NOT** create public issues for security vulnerabilities. Instead:

1. Email us at security@myinboxreport.com
2. Include detailed information about the vulnerability
3. Allow time for us to address the issue before public disclosure

### Security Guidelines

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Follow OAuth best practices
- Validate all user inputs
- Use HTTPS in production

## 📞 Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: Join our community chat (link in README)
- **Email**: contact@myinboxreport.com

## 🏆 Recognition

Contributors will be:

- Listed in our README.md
- Mentioned in release notes
- Invited to our contributors Discord channel
- Eligible for contributor swag (coming soon!)

## 📄 License

By contributing to My Inbox Report, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to My Inbox Report! 🎉 