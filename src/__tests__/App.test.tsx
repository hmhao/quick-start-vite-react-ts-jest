// Imports
import { render, screen, waitFor } from '@testing-library/react';

// To Test
import App from '../App';

jest.mock('localforage', () => ({
  default: { ...jest.requireActual('localforage') },
}));

test('Renders main page correctly', async () => {
  // Setup
  const { container } = render(<App />);
  // wait for router render complete by testing app element children length > 0
  await waitFor(() =>
    expect(container.querySelector('.app')?.children.length).toBeGreaterThan(0),
  );
  // verify page content for default route
  expect(
    screen.getByText('React Router Contacts', { selector: 'h1' }),
  ).toBeInTheDocument();
  expect(screen.getByText('New', { selector: 'button' })).toBeInTheDocument();
  expect(
    screen.getByText('the docs at reactrouter.com', { selector: 'a' }),
  ).toBeInTheDocument();
});

// Tests
test('Renders main page correctly', async () => {
  // Setup
  render(<App />);
  // verify page content for default route
  expect(
    await screen.findByText('React Router Contacts', { selector: 'h1' }),
  ).toBeInTheDocument();
  expect(
    await screen.findByText('New', { selector: 'button' }),
  ).toBeInTheDocument();
  expect(
    await screen.findByText('the docs at reactrouter.com', { selector: 'a' }),
  ).toBeInTheDocument();
});
