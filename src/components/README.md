# Toast System

This directory contains a comprehensive toast notification system built with Looker Components.

## Components

### Toast
A single toast notification component that displays messages with different types (success, error, warning, info).

**Props:**
- `id`: Unique identifier for the toast
- `message`: The text message to display
- `type`: Toast type ('success', 'error', 'warning', 'info') - defaults to 'info'
- `duration`: Auto-close duration in milliseconds - defaults to 5000ms (5 seconds)
- `onClose`: Callback function when toast is closed

### ToastContext
Provides a context and API for managing toast notifications throughout the application.

**Available Methods:**
- `showToast(message, type?, duration?)`: Show a toast with custom type and duration
- `showSuccess(message, duration?)`: Show a success toast
- `showError(message, duration?)`: Show an error toast
- `showWarning(message, duration?)`: Show a warning toast
- `showInfo(message, duration?)`: Show an info toast
- `removeToast(id)`: Manually remove a toast by ID

## Usage

### Basic Usage
```tsx
import { useToast } from './components/ToastContext';

const MyComponent = () => {
  const { showSuccess, showError } = useToast();

  const handleSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleError = () => {
    showError('Something went wrong!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
};
```

### Custom Duration
```tsx
const { showToast } = useToast();

// Show a toast for 10 seconds
showToast('This will stay open for 10 seconds', 'info', 10000);
```

### Different Types
```tsx
const { showSuccess, showError, showWarning, showInfo } = useToast();

showSuccess('Great job!');
showError('Oops, something went wrong');
showWarning('Please check your input');
showInfo('Here is some information');
```

## Features

- **Auto-close**: Toasts automatically close after the specified duration (default: 5 seconds)
- **Manual close**: Users can close toasts by clicking the X button
- **Multiple types**: Support for success, error, warning, and info toasts
- **Custom duration**: Configurable auto-close duration
- **Smooth animations**: Fade in/out and slide animations
- **Status icons**: Each toast type has an appropriate status icon
- **Responsive design**: Toasts are positioned in the top-right corner
- **Stacking**: Multiple toasts can be displayed simultaneously

## Setup

The ToastProvider is already integrated into the app's provider hierarchy in `src/index.tsx`. No additional setup is required.

## Demo

See `ToastDemo.tsx` for examples of all toast types and functionality. 