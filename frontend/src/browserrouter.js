import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FormBuilderPage from './components/builder/FormBuilderPage';

// Configure the router with future flags
export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/builder",
      element: <FormBuilderPage />,
    },
    {
      path: "*",
      element: <HomePage />,
    }
  ],
  {
    // Enable future flags
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);
