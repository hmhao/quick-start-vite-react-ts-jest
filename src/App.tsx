import { FC } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root, {
  loader as rootLoader,
  action as rootAction,
} from '@/routes/Root';
import Error from '@/routes/Error';
import Contact, {
  loader as contactLoader,
  action as contactAction,
} from '@/routes/Contact';
import EditContact, { action as editAction } from '@/routes/Edit';
import { action as destroyAction } from '@/routes/Destroy';
import Index from '@/routes/Index';
import './App.css';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <Error />,
    loader: rootLoader,
    action: rootAction,
    children: [
      {
        errorElement: <Error />,
        children: [
          { index: true, element: <Index /> },
          {
            path: 'contacts/:contactId',
            element: <Contact />,
            loader: contactLoader,
            action: contactAction,
          },
          {
            path: 'contacts/:contactId/edit',
            element: <EditContact />,
            loader: contactLoader,
            action: editAction,
          },
          {
            path: 'contacts/:contactId/destroy',
            action: destroyAction,
            errorElement: <Error />,
          },
        ],
      },
    ],
  },
]);

const App: FC = () => {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
