# Home Energy Monitoring - Signup Page

A modern, responsive React.js signup page for Home Energy Monitoring application, built with **Tailwind CSS** and designed to match the Figma specifications.

## 🎨 **Design Features**

- **Modern UI Design**: Matches the Figma design with blue gradient promotional section and clean white form section
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices using Tailwind's responsive utilities
- **Form Validation**: Real-time validation for email format and password matching
- **Password Toggle**: Show/hide password functionality for both password fields
- **Smooth Animations**: Custom glow animation for the lightbulb icon using Tailwind animations
- **Accessibility**: Proper form labels and keyboard navigation support

## 🛠️ **Tech Stack**

- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Font Awesome**: Beautiful icons for form inputs
- **Custom Animations**: Tailwind-extended animations for enhanced UX

## 🎯 **Tailwind Features Used**

- **Custom Color Palette**: Extended primary colors matching the design
- **Responsive Design**: Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- **Custom Animations**: Glow effect for the lightbulb icon
- **Gradient Backgrounds**: Beautiful gradients for buttons and promotional section
- **Utility Classes**: Comprehensive use of Tailwind utilities for layout, spacing, colors, and effects

## 📱 **Design Elements**

- **Left Section**: Blue gradient background with "Home Energy Monitoring" branding and animated lightbulb icon
- **Right Section**: Clean white form with email, password, and confirm password fields
- **Rounded Corners**: 20px border radius (rounded-3xl) for the modal container
- **Color Scheme**: Blue (#3B82F6), white, and gray color palette using Tailwind's color system
- **Typography**: Clean, modern fonts with Tailwind's font utilities

## 🚀 **Getting Started**

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone or download the project files
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Running the Application

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## 📁 **Project Structure**

```
src/
├── components/
│   └── Signup.js          # Main signup component with Tailwind classes
├── App.js                 # Main app component
├── index.js              # React entry point
└── index.css             # Tailwind CSS imports

public/
├── index.html            # HTML template with Font Awesome
└── manifest.json         # PWA manifest

Configuration Files:
├── tailwind.config.js    # Tailwind configuration with custom colors and animations
├── postcss.config.js     # PostCSS configuration for Tailwind
└── package.json          # Dependencies including Tailwind CSS
```

## ✨ **Tailwind Configuration Highlights**

- **Custom Primary Colors**: Extended blue color palette for brand consistency
- **Custom Animations**: Glow animation for the lightbulb icon
- **Responsive Breakpoints**: Mobile-first responsive design
- **Custom Utilities**: Enhanced styling capabilities

## 📋 **Form Validation**

The signup form includes comprehensive validation:

- **Email**: Required field with proper email format validation
- **Password**: Required field with minimum 6 character length
- **Confirm Password**: Required field that must match the password
- **Real-time Feedback**: Instant validation with Tailwind error styling

## 📱 **Responsive Breakpoints**

- **Mobile**: Base styles (< 640px)
- **Small**: `sm:` (640px+)
- **Medium**: `md:` (768px+)
- **Large**: `lg:` (1024px+)
- **Extra Large**: `xl:` (1280px+)

## 🌟 **Key Tailwind Classes Used**

- **Layout**: `flex`, `grid`, `min-h-screen`, `max-w-*`
- **Spacing**: `p-*`, `m-*`, `gap-*`, `space-*`
- **Colors**: `bg-primary-*`, `text-*`, `border-*`
- **Effects**: `shadow-*`, `blur-*`, `rounded-*`
- **Animations**: `animate-glow`, `transition-*`, `hover:*`

## 🔧 **Custom Tailwind Extensions**

```javascript
// Custom colors in tailwind.config.js
colors: {
  primary: {
    500: '#3b82f6',
    700: '#1d4ed8',
    // ... more shades
  }
}

// Custom animations
animation: {
  'glow': 'glow 2s ease-in-out infinite alternate',
}
```

## 🎨 **Styling Approach**

- **Utility-First**: Extensive use of Tailwind utility classes
- **Component-Based**: Clean separation of concerns
- **Responsive**: Mobile-first responsive design
- **Accessible**: Proper contrast ratios and focus states
- **Performant**: Optimized CSS with Tailwind's purging

## 🌐 **Browser Support**

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📦 **Dependencies**

- React 18
- Tailwind CSS 3.3+
- Font Awesome 6
- PostCSS & Autoprefixer

---

**Built with ❤️ using React and Tailwind CSS**
