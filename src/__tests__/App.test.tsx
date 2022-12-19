// Imports
import { act, render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { matchPath } from 'react-router-dom';
import {
  getContact,
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  initContacts,
  clearContacts,
} from '@/services/contacts';

// To Test
import App, { router } from '../App';

// Mock
jest.mock('localforage', () => ({
  default: { ...jest.requireActual('localforage') },
}));

// Tests
test('Contacts actions', async () => {
  expect(await getContacts()).toEqual([]);
  const contact = await createContact();
  expect(contact).toMatchObject({
    id: expect.any(String),
    createdAt: expect.any(Number),
  });
  const updatedContact = await updateContact(contact.id, {
    first: 'H',
    last: 'C',
    twitter: 'tt',
    avatar: 'https://placekitten.com/g/200/200',
    notes: 'Hello, \nWorld!',
  });
  expect(updatedContact).toEqual({
    id: contact.id,
    createdAt: contact.createdAt,
    first: 'H',
    last: 'C',
    twitter: 'tt',
    avatar: 'https://placekitten.com/g/200/200',
    notes: 'Hello, \nWorld!',
  });
  expect(await getContact(contact.id)).toEqual(updatedContact);
  expect(await deleteContact(contact.id)).toBe(true);
  expect(await getContacts()).toEqual([]);
  await initContacts(5);
  expect((await getContacts()).length).toBe(5);
  await clearContacts();
  expect((await getContacts()).length).toBe(0);
});

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

describe('Renders edit page correctly', () => {
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

  afterEach(async () => {
    await clearContacts();
    // Manual trigger route rerender
    await act(() => router.navigate('/', { replace: true }));
  });

  test('Navigate edit page and navigate back correctly', async () => {
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

describe('Renders contact page with data correctly', () => {
  let index = 0;
  let contacts: Contact[];
  beforeAll(async () => {
    await initContacts(2);
    contacts = await getContacts();
  });

  beforeEach(async () => {
    // Setup
    render(<App />);
    // Manual trigger route rerender
    await act(() => router.navigate('/', { replace: true }));
    await Promise.all(
      contacts.map(async (contact) =>
        expect(
          await screen.findByRole('link', {
            name: `${contact.first} ${contact.last}`,
          }),
        ).toBeInTheDocument(),
      ),
    );
    const contact = contacts[index];
    // Navigate contact route
    await user.click(
      await screen.findByRole('link', {
        name: `${contact.first} ${contact.last}`,
      }),
    );
    // Wait for edit route render
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
  });

  afterEach(() => {
    index++;
  });

  afterAll(async () => {
    await clearContacts();
  });

  test('Navigate contact page correctly', async () => {
    const contact = contacts[index];
    // Verify page content for expected route after navigating
    // sidebar content
    expect(
      screen.getByRole('link', { name: `${contact.first} ${contact.last}` }),
    ).toBeInTheDocument();
    // detail content
    expect(
      screen.getByRole('heading', {
        name: `${contact.first} ${contact.last} ☆`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: contact.twitter }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'avatar' })).toBeInTheDocument();
    expect(
      screen.getByText((content) => content === contact.notes),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  test('Favorite contact correctly', async () => {
    const contact = contacts[index];
    // Add to favorites
    await user.click(await screen.findByText('☆', { selector: 'button' }));
    // Wait for change contact favorite
    expect(
      await screen.findByRole(
        'link',
        {
          name: `${contact.first} ${contact.last} ★`,
        },
        {
          timeout: 2000,
        },
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', {
        name: `${contact.first} ${contact.last} ★`,
      }),
    ).toBeInTheDocument();

    // Remove from favorites
    await user.click(await screen.findByText('★', { selector: 'button' }));
    // Wait for change contact favorite
    expect(
      await screen.findByRole(
        'link',
        {
          name: `${contact.first} ${contact.last}`,
        },
        {
          timeout: 2000,
        },
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', {
        name: `${contact.first} ${contact.last} ☆`,
      }),
    ).toBeInTheDocument();
  });
});

describe('Render default search at sidebar with searchParams q', () => {
  let contacts: Contact[];
  beforeAll(async () => {
    await initContacts(2);
    contacts = await getContacts();
  });

  afterAll(async () => {
    await clearContacts();
  });

  test('q is empty string', async () => {
    render(<App />);
    // Manual trigger route rerender
    await act(() =>
      router.navigate(
        {
          pathname: '/',
          search: 'q=',
        },
        { replace: true },
      ),
    );
    // expect render 2 contact at sidebar
    await Promise.all(
      contacts.map(async (contact) =>
        expect(
          await screen.findByRole('link', {
            name: `${contact.first} ${contact.last}`,
          }),
        ).toBeInTheDocument(),
      ),
    );
  });

  test('q is not match contacts', async () => {
    render(<App />);
    // Manual trigger route rerender
    await act(() =>
      router.navigate(
        {
          pathname: '/',
          search: `q=${contacts[0].first + 'q'}`,
        },
        { replace: true },
      ),
    );
    expect(screen.getByText('No contacts')).toBeInTheDocument();
  });

  test('q is match one contact', async () => {
    render(<App />);
    // Manual trigger route rerender
    await act(() =>
      router.navigate(
        {
          pathname: '/',
          search: `q=${contacts[0].first.slice(1, 3)}`,
        },
        { replace: true },
      ),
    );
    expect(
      screen.getByRole('link', {
        name: `${contacts[0].first} ${contacts[0].last}`,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(1);
  });
});
