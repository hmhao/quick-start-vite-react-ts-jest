// Imports
import { render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { matchPath } from 'react-router-dom';

// To Test
import App from '../App';

// Mock
jest.mock('localforage', () => ({
  default: { ...jest.requireActual('localforage') },
}));

test('Renders main page correctly', async () => {
  // Setup
  const { container } = render(<App />);
  // Wait for router render complete by testing app element children length > 0
  await waitFor(() =>
    expect(container.querySelector('.app')?.children.length).toBeGreaterThan(0),
  );
  // Verify page content for default route
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
  // Verify page content for default route
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

describe('Renders Edit page correctly', () => {
  beforeEach(async () => {
    // Setup
    render(<App />);
    // Navigate target route
    await user.click(await screen.findByText('New', { selector: 'button' }));
    // Wait for edit route render
    await waitFor(
      () =>
        // Verify route pathname
        expect(
          matchPath('contacts/:contactId/edit', window.location.pathname),
        ).toBeTruthy(),
      {
        timeout: 2000,
      },
    );
  });

  test('Navigate route and navigate back correctly', async () => {
    // Verify page content for expected route after navigating
    // sidebar content
    expect(screen.getByRole('link', { name: 'No Name' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'No Name' })).toHaveClass('active');
    // detail content
    expect(screen.getByRole('textbox', { name: /first/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /last/i })).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /twitter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /avatar/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    // Navigate back
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    // Wait for back route render
    await waitFor(() =>
      // Verify route pathname
      expect(matchPath('', window.location.pathname)).toBeTruthy(),
    );
    expect(
      screen.getByRole('link', { name: 'the docs at reactrouter.com' }),
    ).toBeInTheDocument();
  });

  test('Change and submit form correctly', async () => {
    // Change form item
    await user.type(screen.getByRole('textbox', { name: /first/i }), 'H');
    await user.type(screen.getByRole('textbox', { name: /last/i }), 'C');
    await user.type(screen.getByRole('textbox', { name: /twitter/i }), 'tt');
    await user.type(
      screen.getByRole('textbox', { name: /avatar/i }),
      'https://placekitten.com/g/200/200',
    );
    await user.type(
      screen.getByRole('textbox', { name: /notes/i }),
      'Hello, \nWorld!',
    );
    // Verify form item
    expect(screen.getByRole('textbox', { name: /first/i })).toHaveValue('H');
    expect(screen.getByRole('textbox', { name: /last/i })).toHaveValue('C');
    expect(screen.getByRole('textbox', { name: /twitter/i })).toHaveValue('tt');
    expect(screen.getByRole('textbox', { name: /avatar/i })).toHaveValue(
      'https://placekitten.com/g/200/200',
    );
    expect(screen.getByRole('textbox', { name: /notes/i })).toHaveValue(
      'Hello, \nWorld!',
    );
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Save' }));
    // Wait for save route render
    await waitFor(
      () =>
        // Verify route pathname
        expect(
          matchPath('contacts/:contactId', window.location.pathname),
        ).toBeTruthy(),
      {
        timeout: 2000,
      },
    );
    // Verify page content for expected route after navigating
    // sidebar content
    expect(screen.getByRole('link', { name: /H C/ })).toBeInTheDocument();
    // detail content
    expect(screen.getByRole('heading', { name: /H C ☆/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'tt' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'avatar' })).toBeInTheDocument();
    expect(
      screen.getByText((content) => content === 'Hello, World!'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
