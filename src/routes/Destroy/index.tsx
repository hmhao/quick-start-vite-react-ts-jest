import { ActionFunction, redirect } from 'react-router-dom';
import { deleteContact } from '@/services/contacts';

export const action: ActionFunction = async ({ params }) => {
  await deleteContact(params.contactId || '');
  return redirect('/');
};
