import localforage from 'localforage';

// fake a cache so we don't slow down stuff we've already seen
let fakeCache: Record<string, any> = {};

const fakeNetwork = async (key = '') => {
  if (!key) {
    fakeCache = {};
  }

  if (fakeCache[key]) {
    return;
  }

  fakeCache[key] = true;
  return new Promise((res) => {
    setTimeout(res, Math.random() * 800);
  });
};

const ContactsKey = 'contacts';

export const initContacts = async (len: number) => {
  const contacts = await Promise.all(
    Array(len)
      .fill('')
      .map(async (item, index) => ({
        id: Math.random().toString(36).substring(2, 9),
        createdAt: Date.now() + index,
        first: `H${index}`,
        last: `C${index}`,
        twitter: `tt${index}`,
        avatar: `https://placekitten.com/g/200/20${index}`,
        notes: `${index}`,
        favorite: false,
      })),
  );
  await localforage.setItem(ContactsKey, contacts);
};

export const clearContacts = async () => {
  await localforage.setItem(ContactsKey, []);
};

export const getContacts = async (query?: string) => {
  await fakeNetwork(`getContacts:${query}`);
  let contacts = (await localforage.getItem<Contact[]>(ContactsKey)) ?? [];
  if (query) {
    contacts = contacts.filter(
      (contact) =>
        contact.first.includes(query) || contact.last.includes(query),
    );
  }
  return contacts.sort((c1, c2) => (c1.createdAt > c2.createdAt ? -1 : 1));
};

export const createContact = async () => {
  await fakeNetwork();
  const id = Math.random().toString(36).substring(2, 9);
  const contact = { id, createdAt: Date.now() } as Contact;
  const contacts = await getContacts();
  contacts.unshift(contact);
  await localforage.setItem(ContactsKey, contacts);
  return contact;
};

export const getContact = async (id: string) => {
  await fakeNetwork(`contact:${id}`);
  const contacts = (await localforage.getItem<Contact[]>(ContactsKey)) ?? [];
  const contact = contacts.find((contact) => contact.id === id);
  return contact ?? null;
};

export const updateContact = async (id: string, update: Partial<Contact>) => {
  await fakeNetwork();
  const contacts = (await localforage.getItem<Contact[]>(ContactsKey)) ?? [];
  const contact = contacts.find((contact) => contact.id === id);
  if (!contact) throw new Error(`No contact found for ${id}`);
  Object.assign(contact, update);
  await localforage.setItem(ContactsKey, contacts);
  return contact;
};

export const deleteContact = async (id: string) => {
  const contacts = (await localforage.getItem<Contact[]>(ContactsKey)) ?? [];
  const index = contacts.findIndex((contact) => contact.id === id);
  if (index > -1) {
    contacts.splice(index, 1);
    await localforage.setItem(ContactsKey, contacts);
    return true;
  }
  return false;
};
